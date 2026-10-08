/* "Download estimate (PDF)": opens a print-ready estimate in a new tab and starts the
 * browser's print dialog, where "Save as PDF" produces the file. Printing from the browser
 * keeps the ₹ sign, the fonts and the layout exact without shipping a PDF library.
 * Public estimates only: floor prices are never part of what this receives. */

import { RAID_INFO, inr } from './logic.js';
import { digibuggy } from '../../data/site.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function openEstimatePdf({ ref, build, price, lines, raid, speed, mode, targetTB, budget }) {
  const win = window.open('', '_blank');
  if (!win) return false; // pop-up blocked: the caller tells the visitor
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const origin = window.location.origin;
  const rows = lines.filter((l) => !l.total).map((l) => (l.subtotal
    ? `<tr class="sub"><td>${esc(l.label)}</td><td></td><td class="num">${inr(l.quote)}</td></tr>`
    : `<tr><td><strong>${esc(l.label)}</strong>${l.detail ? `<br><span class="muted">${esc(l.detail)}</span>` : ''}</td><td class="muted">${esc(l.basis)}</td><td class="num">${inr(l.quote)}</td></tr>`)).join('');

  win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>NASTOWN estimate ${esc(ref)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Inter, "Segoe UI", system-ui, sans-serif; color: #1e293b; margin: 0; font-size: 12.5px; line-height: 1.5; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e293b; padding-bottom: 14px; }
  .head img { height: 64px; }
  .head .meta { text-align: right; font-size: 11.5px; color: #475569; }
  h1 { font-size: 20px; margin: 22px 0 4px; letter-spacing: -0.01em; }
  .muted { color: #64748b; font-size: 11.5px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0 20px; }
  .grid div { background: #f1f5f9; border-radius: 8px; padding: 10px 12px; }
  .grid b { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; font-weight: 600; }
  .grid span { font-size: 14px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; border-bottom: 1px solid #cbd5e1; padding: 8px 6px; }
  td { padding: 9px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  tr.sub td { font-weight: 600; background: #f8fafc; }
  .total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; padding: 14px 12px; background: #1e293b; color: #fff; border-radius: 8px; }
  .total strong { font-size: 20px; font-variant-numeric: tabular-nums; }
  .notes { margin-top: 18px; font-size: 11px; color: #475569; }
  .foot { margin-top: 26px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #475569; }
  @media screen { body { max-width: 820px; margin: 24px auto; padding: 0 20px; } }
</style></head><body>
  <div class="head">
    <img src="${origin}/nastown-logo-full.png" alt="NASTOWN">
    <div class="meta"><strong>Estimate ${esc(ref)}</strong><br>${esc(date)}<br>Subject to availability</div>
  </div>
  <h1>${esc(build.units > 1 ? `${build.units} × ` : '')}${esc(build.model.brand)} ${esc(build.model.model)}</h1>
  <div class="muted">${esc(build.model.bays)}-bay NAS · ${mode === 'budget' ? `sized for a budget of ${inr(budget)}` : `sized for ${esc(targetTB)} TB usable`}</div>
  <div class="grid">
    <div><b>Usable</b><span>${esc(build.totalUsable)} TB</span></div>
    <div><b>RAID</b><span>${esc(RAID_INFO[raid].title)}</span></div>
    <div><b>Drives</b><span>${esc(price.totalDrives)} × ${esc(build.driveCap)} TB</span></div>
    <div><b>Network</b><span>${esc(speed ?? '—')}</span></div>
  </div>
  <table>
    <thead><tr><th>Item</th><th>Basis</th><th class="num">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total"><span>Estimated total (GST inclusive)</span><strong>${inr(price.total)}</strong></div>
  <p class="notes">Prices include GST and come from our live price list. This is an estimate: availability and final pricing are confirmed in your formal quotation.</p>
  <div class="foot">NASTOWN by Digibuggy · ${esc(digibuggy.address)}<br>WhatsApp ${esc(digibuggy.whatsapp)} · ${esc(digibuggy.email)} · ${esc(origin.replace(/^https?:\/\//, ''))}</div>
  <script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 250); });</script>
</body></html>`);
  win.document.close();
  return true;
}
