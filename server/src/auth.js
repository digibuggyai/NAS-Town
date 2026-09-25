// Staff authentication: scrypt password hashes and HMAC-signed bearer tokens.
// Role checks happen here, on the server, never only in the UI.
import crypto from 'node:crypto';
import * as store from './db/store.js';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const secret = process.env.AUTH_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET must be set in production');
  console.warn('[auth] AUTH_SECRET not set; using a random secret (sessions reset on restart).');
  return crypto.randomBytes(32).toString('hex');
})();

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored).split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

export function issueToken(user) {
  const body = b64(JSON.stringify({ sub: user.id, email: user.email, role: user.role, name: user.name, exp: Date.now() + TOKEN_TTL_MS }));
  return `${body}.${sign(body)}`;
}

function readToken(token) {
  const [body, sig] = String(token ?? '').split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
  return claims.exp > Date.now() ? claims : null;
}

/** Express middleware: require a signed-in user with one of the given roles. */
export const requireRole = (...roles) => (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  let claims = null;
  try { claims = readToken(token); } catch { claims = null; }
  if (!claims) return res.status(401).json({ error: 'Please sign in.' });
  if (!roles.includes(claims.role)) return res.status(403).json({ error: 'You do not have access to this.' });
  req.user = claims;
  next();
};
export const requireAdmin = requireRole('admin');
export const requireStaff = requireRole('admin', 'sales');

// Simple login throttle: 8 attempts per IP per 10 minutes.
const attempts = new Map();
export function loginAllowed(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length <= 8;
}

/** Create the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when no admin exists yet. */
export async function bootstrapAdmin() {
  if ((await store.countAdmins()) > 0) return;
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    if (store.usingDatabase) {
      console.warn('[auth] No admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart to create one.');
      return;
    }
    // Local in-memory development only.
    email = 'admin@nastown.local';
    password = crypto.randomBytes(9).toString('base64url');
    console.warn(`[auth] Dev admin created: ${email} / ${password}`);
  }
  await store.createUser({ email: email.toLowerCase(), name: 'Admin', role: 'admin', passwordHash: hashPassword(password) });
  console.log(`[auth] Admin account ready: ${email}`);
}
