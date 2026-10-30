// Outgoing email through Resend's HTTP API (https://resend.com). HTTP rather than SMTP because
// Railway blocks outgoing SMTP on most plans. No API key = emails are skipped with a log line,
// so the site keeps working before email is set up.
//
//   RESEND_API_KEY   from resend.com → API Keys
//   MAIL_FROM        a sender on a domain verified in Resend, e.g. "NASTOWN <quotes@nastown.com>"
//   MAIL_REPLY_TO    where customer replies go (optional), e.g. sales@nastown.com
//   LEAD_NOTIFY_TO   who hears about new leads; comma-separated (default bhavya.digibuggy@gmail.com)

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM || 'NASTOWN <onboarding@resend.dev>';
const REPLY_TO = process.env.MAIL_REPLY_TO || undefined;
export const LEAD_NOTIFY_TO = (process.env.LEAD_NOTIFY_TO || 'bhavya.digibuggy@gmail.com').split(',').map((s) => s.trim()).filter(Boolean);
export const mailEnabled = Boolean(KEY);

/** Send one email. Never throws: a failed email must not fail the customer's request. */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const list = [to].flat().filter(Boolean);
  if (!list.length) return false;
  if (!KEY) {
    console.log(`[mail] RESEND_API_KEY not set; skipped "${subject}" to ${list.join(', ')}`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: list, subject, html, text, reply_to: replyTo ?? REPLY_TO }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error(`[mail] "${subject}" to ${list.join(', ')} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[mail] "${subject}" to ${list.join(', ')} failed: ${e.message}`);
    return false;
  }
}
