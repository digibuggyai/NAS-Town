// Emails sent when a lead arrives:
//  1. An alert to the sales team (LEAD_NOTIFY_TO) for every lead, with everything the customer sent.
//  2. To the customer:
//     - a configurator quotation request → their quotation, priced again here from the live
//       price list (quote prices only, never floors). Figures sent by the browser are never
//       emailed, so nobody can make NASTOWN mail made-up prices to anyone.
//     - a coupon request → their coupon code.
// Nothing here throws: emails go out after the lead is saved and can't fail the request.
import { LEAD_NOTIFY_TO, sendMail } from './mailer.js';
import { toPublicPricing } from './pricing.js';

const SITE = (process.env.SITE_URL || 'https://nastown.com').replace(/\/+$/, '');
const WHATSAPP = 'https://wa.me/919560111954';
const RAIDS = new Set(['RAID0', 'RAID1', 'RAID5', 'RAID6', 'RAID10']);
const TYPE_LABEL = {
  configurator: 'Configurator quotation request', offer: 'Coupon / call-back request', contact: 'Contact form',
  rental: 'NAS rental enquiry', service: 'Service booking', expert: 'Talk to an expert',
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const br = (s) => esc(s).replace(/\n/g, '<br>');

function usable(raid, n, c) {
  return { RAID0: n * c, RAID1: c, RAID5: (n - 1) * c, RAID6: (n - 2) * c, RAID10: (n / 2) * c }[raid] ?? null;
}

/** The quotation for a configuration, from the live price list. null if it doesn't add up. */
export async function serverQuote(cfg = {}) {
  const P = await toPublicPricing();
  const model = P.models.find((m) => m.model === cfg.model);
  const cap = Number(cfg.driveCap);
  const drive = P.hddPricing[cap]?.[cfg.driveLine];
  const n = Math.round(Number(cfg.drives));
  if (!model || !drive || !(n >= 1 && n <= (model.baysWithExpansion ?? model.bays))) return null;
  const raid = RAIDS.has(cfg.raid) ? cfg.raid : null;
  const ram = cfg.ramSku ? P.upgrades.find((u) => u.category === 'RAM' && u.sku === cfg.ramSku) : null;
  const nic = cfg.nicSku ? P.upgrades.find((u) => u.category === 'NIC' && u.sku === cfg.nicSku) : null;

  const rows = [
    { label: `${model.brand} ${model.model}`, detail: `${model.bays}-bay NAS`, qty: 1, amount: model.quote },
    { label: `${cfg.driveLine} ${cap} TB`, detail: `Hard drive${n > 1 ? 's' : ''}`, qty: n, amount: drive.quote * n },
  ];
  if (ram) rows.push({ label: ram.name, detail: 'RAM upgrade', qty: 1, amount: ram.quote });
  if (nic) rows.push({ label: nic.name, detail: 'Network card', qty: 1, amount: nic.quote });
  const hardware = rows.reduce((s, r) => s + r.amount, 0);
  if (cfg.install) rows.push({ label: 'Installation & setup', detail: 'On-site, Delhi NCR only', qty: 1, amount: P.install.quote });
  if (cfg.amc) rows.push({ label: 'Annual maintenance (AMC)', detail: `${Math.round(P.amcRate.quote * 100)}% of hardware, first year`, qty: 1, amount: hardware * P.amcRate.quote });
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return { model, raid, drives: n, cap, line: cfg.driveLine, usableTB: raid ? usable(raid, n, cap) : null, rows, hardware, total };
}

/* ---------------- layout ---------------- */

const wrap = (inner) => `<!doctype html><html><body style="margin:0;background:#f5f7fb;font-family:Segoe UI,Arial,sans-serif;color:#1e293b">
<div style="max-width:620px;margin:0 auto;padding:24px">
  <p style="font-size:18px;font-weight:700;letter-spacing:2px;color:#0f172a;margin:0 0 16px">NASTOWN</p>
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px">${inner}</div>
  <p style="font-size:12px;color:#64748b;margin:16px 4px 0">NASTOWN, a DigiBuggy (DGB India) company · 207, Mansarovar Building, Nehru Place, New Delhi 110019 · <a href="${SITE}" style="color:#3a67ff">${SITE.replace(/^https?:\/\//, '')}</a></p>
</div></body></html>`;

const kv = (pairs) => `<table style="border-collapse:collapse;width:100%;font-size:14px">${pairs
  .filter(([, v]) => v != null && v !== '')
  .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${v}</td></tr>`).join('')}</table>`;

function quoteTable(q) {
  const rows = q.rows.map((r) => `<tr>
    <td style="padding:10px 8px 10px 0;border-bottom:1px solid #eef2f7"><b>${esc(r.label)}</b><br><span style="color:#64748b;font-size:12px">${esc(r.detail)}</span></td>
    <td style="padding:10px 8px;border-bottom:1px solid #eef2f7;text-align:center">${r.qty}</td>
    <td style="padding:10px 0 10px 8px;border-bottom:1px solid #eef2f7;text-align:right;white-space:nowrap">${inr(r.amount)}</td></tr>`).join('');
  return `<table style="border-collapse:collapse;width:100%;font-size:14px;margin-top:8px">
    <tr style="color:#64748b;font-size:12px;text-align:left"><th style="padding:0 8px 6px 0;font-weight:500">Item</th><th style="padding:0 8px 6px;font-weight:500;text-align:center">Qty</th><th style="padding:0 0 6px 8px;font-weight:500;text-align:right">Amount</th></tr>
    ${rows}
    <tr><td colspan="2" style="padding:14px 8px 0 0;font-size:16px"><b>Total</b> <span style="color:#64748b;font-size:12px">incl. GST</span></td>
    <td style="padding:14px 0 0 8px;text-align:right;font-size:20px;font-weight:700;white-space:nowrap">${inr(q.total)}</td></tr></table>`;
}

/* ---------------- the emails ---------------- */

function teamAlert(lead, q) {
  const p = lead.payload ?? {};
  const label = TYPE_LABEL[lead.type] ?? lead.type;
  const subject = `New lead: ${label} – ${lead.name}${q ? ` (${inr(q.total)})` : ''}`;
  const html = wrap(`
    <p style="margin:0 0 4px;color:#3a67ff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">New lead</p>
    <h2 style="margin:0 0 16px;font-size:20px">${esc(label)}</h2>
    ${kv([
      ['Name', esc(lead.name)],
      ['Email', lead.email && `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>`],
      ['Phone', lead.phone && `<a href="tel:${esc(lead.phone)}">${esc(lead.phone)}</a>`],
      ['Reference', p.ref && esc(p.ref)],
      ['Coupon', p.coupon && esc(p.coupon)],
      ['Message', lead.message && br(lead.message)],
    ])}
    ${q ? `<h3 style="margin:20px 0 0;font-size:15px">Quotation (live prices)</h3>${quoteTable(q)}` : ''}
    ${p.summary ? `<h3 style="margin:20px 0 6px;font-size:15px">What the customer configured</h3><p style="font-size:13px;line-height:1.6;color:#334155;margin:0">${br(p.summary)}</p>` : ''}
    <p style="margin:22px 0 0"><a href="${SITE}/admin/leads" style="background:#3a67ff;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px">Open in Admin → Leads</a></p>
    ${q && lead.email ? '<p style="font-size:12px;color:#64748b;margin:14px 0 0">The customer has been emailed this quotation.</p>' : ''}`);
  return { subject, html };
}

function customerQuote(lead, q) {
  const ref = lead.payload?.ref ? ` ${lead.payload.ref}` : '';
  const subject = `Your NASTOWN quotation${ref}`;
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px">Hi ${esc(lead.name.split(' ')[0])}, here's your NAS quotation</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155">Thanks for building your NAS with us. Here is the configuration you chose, priced from our current price list. Our team will call you shortly to confirm availability and send the formal quotation.</p>
    ${kv([
      ['Reference', ref && esc(ref.trim())],
      ['NAS', `${esc(q.model.brand)} ${esc(q.model.model)} (${q.model.bays}-bay)`],
      ['Drives', `${q.drives} × ${q.cap} TB ${esc(q.line)}`],
      ['RAID', q.raid && esc(q.raid.replace('RAID', 'RAID '))],
      ['Usable space', q.usableTB != null && `${q.usableTB} TB`],
    ])}
    ${quoteTable(q)}
    <p style="font-size:12px;color:#64748b;line-height:1.6;margin:16px 0 0">Prices include GST. This is an estimate: availability and the final price are confirmed in your formal quotation. On-site installation is available in Delhi NCR only.</p>
    <p style="margin:20px 0 0"><a href="${WHATSAPP}?text=${encodeURIComponent(`Hi NASTOWN, about my quotation${ref}`)}" style="background:#22c55e;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px">Chat with us on WhatsApp</a></p>`);
  return { subject, html };
}

function customerCoupon(lead) {
  const p = lead.payload ?? {};
  const subject = `Your NASTOWN coupon: ${p.coupon}`;
  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:20px">Hi ${esc(lead.name.split(' ')[0])}, your coupon is ready</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155">Here is your coupon for ${inr(p.couponValue ?? 2000)} off your NAS quotation. Our team will call you to help choose the right setup.</p>
    <p style="margin:0;padding:16px;border:2px dashed #3a67ff;border-radius:12px;text-align:center;font-size:24px;font-weight:700;letter-spacing:3px;color:#1459f2">${esc(p.coupon)}</p>
    <p style="font-size:12px;color:#64748b;line-height:1.6;margin:16px 0 0">One coupon per customer, applied to your formal quotation and not combinable with other offers.</p>
    <p style="margin:20px 0 0"><a href="${SITE}/tools/configurator" style="background:#3a67ff;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px">Build your NAS</a></p>`);
  return { subject, html };
}

/** Send the emails for a new lead. Call without awaiting. */
export async function emailLead(lead) {
  try {
    const q = lead.type === 'configurator' ? await serverQuote(lead.payload?.configuration) : null;
    const jobs = [sendMail({ to: LEAD_NOTIFY_TO, replyTo: lead.email || undefined, ...teamAlert(lead, q) })];
    if (lead.email && q) jobs.push(sendMail({ to: lead.email, ...customerQuote(lead, q) }));
    if (lead.email && lead.type === 'offer' && lead.payload?.coupon && lead.payload?.isNewCoupon) jobs.push(sendMail({ to: lead.email, ...customerCoupon(lead) }));
    await Promise.all(jobs);
  } catch (e) {
    console.error('[mail] lead emails failed:', e.message);
  }
}
