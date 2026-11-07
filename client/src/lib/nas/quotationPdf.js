import { RAID_INFO, inr } from './logic.js';
import { digibuggy } from '../../data/site.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function belowHundred(n) {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}

function belowThousand(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', r ? belowHundred(r) : ''].filter(Boolean).join(' ');
}

export function rupeesInWords(amount) {
  let n = Math.round(amount);
  if (!n) return 'Rupees Zero Only';
  const parts = [];
  for (const [size, name] of [[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']]) {
    const q = Math.floor(n / size);
    if (q) parts.push(`${q >= 100 ? belowThousand(q) : belowHundred(q)} ${name}`);
    n %= size;
  }
  if (n) parts.push(belowThousand(n));
  return `Rupees ${parts.join(' ')} Only`;
}

const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export function quotationTerms({ validUntil, install }) {
  return [
    'All prices are in Indian Rupees and inclusive of GST.',
    'Supply is subject to stock availability at the time of order.',
    'Warranty on all hardware is as per the manufacturer’s terms.',
    install ? 'On-site installation and setup is available in Delhi NCR only.' : null,
    `This quotation is valid until ${fmtDate(validUntil)}.`,
  ].filter(Boolean);
}

export function openQuotationPdf({ ref, build, price, lines, raid, speed, validDays = 7 }) {
  const win = window.open('', '_blank');
  if (!win) return false;
  const origin = window.location.origin;
  const today = new Date();
  const validUntil = new Date(today.getTime() + validDays * 86400000);
  const install = lines.some((l) => l.key === 'install');
  const termList = quotationTerms({ validUntil, install });

  let sno = 0;
  const items = lines.filter((l) => !l.subtotal && !l.total).map((l) => {
    sno += 1;
    const qty = l.qty ?? 1;
    const rate = l.qty != null ? l.rate : l.quote;
    return `<tr>
      <td class="c">${sno}</td>
      <td><strong>${esc(l.label)}</strong>${l.detail ? `<div class="muted">${esc(l.detail)}</div>` : ''}</td>
      <td class="c">${esc(qty)}</td>
      <td class="num">${inr(rate)}</td>
      <td class="num">${inr(l.quote)}</td>
    </tr>`;
  }).join('');

  const find = (key) => lines.find((l) => l.key === key);
  const summary = [
    ['Hardware', find('hardware')?.quote],
    ['Installation & setup', find('install')?.quote],
    ['Annual maintenance (AMC)', find('amc')?.quote],
  ].filter(([, v]) => v != null).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${inr(v)}</td></tr>`).join('');

  win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>NASTOWN quotation ${esc(ref)}</title>
<style>
  @page { size: A4; margin: 12mm 12mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Manrope, "Segoe UI", system-ui, sans-serif; color: #1e293b; margin: 0; font-size: 11.5px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .top { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 12px; }
  .brands { display: flex; align-items: center; gap: 18px; }
  .brands .nt { height: 62px; }
  .brands .sep { width: 1px; height: 44px; background: #cbd5e1; }
  .brands .db { height: 16px; filter: brightness(0); }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 24px; letter-spacing: .18em; color: #1d4ed8; }
  .doc table { margin-left: auto; margin-top: 6px; border-collapse: collapse; }
  .doc td { padding: 1px 0 1px 12px; font-size: 11px; }
  .doc td:first-child { color: #64748b; }
  .bar { height: 4px; background: linear-gradient(90deg, #1d4ed8, #3a67ff 60%, #93c5fd); border-radius: 4px; }
  .parties { margin: 14px 0; }
  .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
  .label { font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
  .muted { color: #64748b; font-size: 10.5px; }
  .spec { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
  .spec div { padding: 8px 10px; border-right: 1px solid #e2e8f0; background: #f8fafc; }
  .spec div:last-child { border-right: 0; }
  .spec b { display: block; font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: #64748b; font-weight: 700; }
  .spec span { font-weight: 700; font-size: 12px; }
  table.items { width: 100%; border-collapse: collapse; }
  .items th { background: #1e293b; color: #fff; font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; text-align: left; padding: 8px; }
  .items td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  .items tr:nth-child(even) td { background: #f8fafc; }
  .c { text-align: center; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .items th.num, .items th.c { text-align: right; }
  .items th.c { text-align: center; }
  .totals { display: grid; grid-template-columns: 1fr 260px; gap: 16px; margin-top: 12px; align-items: start; }
  .words { border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px 12px; }
  .words strong { display: block; font-size: 12px; margin-top: 2px; }
  table.sum { width: 100%; border-collapse: collapse; }
  .sum td { padding: 5px 8px; }
  .sum tr.grand td { background: #1d4ed8; color: #fff; font-weight: 700; font-size: 14px; padding: 9px 8px; }
  .sum tr.grand td:first-child { border-radius: 6px 0 0 6px; }
  .sum tr.grand td:last-child { border-radius: 0 6px 6px 0; }
  .lower { display: grid; grid-template-columns: 1fr 220px; gap: 16px; margin-top: 18px; }
  ol { margin: 0; padding-left: 16px; }
  ol li { margin-bottom: 2px; }
  .sign { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; }
  .sign .line { border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 10.5px; color: #475569; }
  .foot { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 10px; color: #64748b; }
  .foot img { height: 11px; filter: brightness(0); opacity: .75; }
  @media screen { body { max-width: 860px; margin: 24px auto; padding: 0 20px; } }
</style></head><body>
  <div class="top">
    <div class="brands">
      <img class="nt" src="${origin}/nastown-logo-full.png" alt="NASTOWN">
      <span class="sep"></span>
      <img class="db" src="${origin}/digibuggy-logo.svg" alt="DigiBuggy">
    </div>
    <div class="doc">
      <h1>QUOTATION</h1>
      <table>
        <tr><td>Quotation no.</td><td><strong>${esc(ref)}</strong></td></tr>
        <tr><td>Date</td><td>${esc(fmtDate(today))}</td></tr>
        <tr><td>Valid until</td><td>${esc(fmtDate(validUntil))}</td></tr>
      </table>
    </div>
  </div>
  <div class="bar"></div>

  <div class="parties">
    <div class="box">
      <div class="label">From</div>
      <strong>NASTOWN</strong> <span class="muted">· a DigiBuggy company</span><br>
      ${esc(digibuggy.address)}<br>
      Phone / WhatsApp: ${esc(digibuggy.whatsapp)}<br>
      Email: ${esc(digibuggy.email)} · ${esc(origin.replace(/^https?:\/\//, ''))}
    </div>
  </div>

  <div class="spec">
    <div><b>NAS</b><span>${esc(build.model.brand)} ${esc(build.model.model)}</span></div>
    <div><b>Bays</b><span>${esc(build.model.bays)}</span></div>
    <div><b>Drives</b><span>${esc(price.totalDrives)} × ${esc(build.driveCap)} TB</span></div>
    <div><b>RAID</b><span>${esc(RAID_INFO[raid].title)}</span></div>
    <div><b>Usable</b><span>${esc(build.totalUsable)} TB</span></div>
  </div>

  <table class="items">
    <thead><tr><th class="c" style="width:34px">#</th><th>Description</th><th class="c" style="width:44px">Qty</th><th class="num" style="width:100px">Unit price</th><th class="num" style="width:110px">Amount</th></tr></thead>
    <tbody>${items}</tbody>
  </table>

  <div class="totals">
    <div class="words">
      <div class="label">Amount in words</div>
      <strong>${esc(rupeesInWords(price.total))}</strong>
      ${speed ? `<div class="muted" style="margin-top:6px">Network: ${esc(speed)}</div>` : ''}
    </div>
    <table class="sum">
      ${summary}
      <tr class="grand"><td>Total (incl. GST)</td><td class="num">${inr(price.total)}</td></tr>
    </table>
  </div>

  <div class="lower">
    <div>
      <div class="label">Terms &amp; conditions</div>
      <ol>${termList.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    </div>
    <div class="sign">
      <div class="muted">For NASTOWN (DigiBuggy)</div>
      <div class="line">Authorised signatory</div>
    </div>
  </div>

  <div class="foot">
    <span>Thank you for your business. This is a computer-generated quotation.</span>
    <span style="display:flex;align-items:center;gap:6px">NASTOWN by <img src="${origin}/digibuggy-logo.svg" alt="DigiBuggy"></span>
  </div>
  <script>
    function go() { setTimeout(function () { window.print(); }, 300); }
    var imgs = Array.prototype.slice.call(document.images);
    Promise.all(imgs.map(function (i) { return i.complete ? 0 : new Promise(function (r) { i.onload = i.onerror = r; }); })).then(go);
  </script>
</body></html>`);
  win.document.close();
  return true;
}
