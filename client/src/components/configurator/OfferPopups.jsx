import { useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { RAID_INFO, inr } from '../../lib/nas/logic.js';
import { Dialog } from './parts.jsx';

/* The two configurator popups. Both offer a ₹2,000 coupon; every customer gets their own
 * code, issued by the server (POST /api/offers) and saved with their lead in Admin → Leads.
 *   IntroPopup:      10 s after opening, when the visitor hasn't built a configuration yet.
 *   QuoteOfferPopup: 10 s after their quote is complete, showing that quote.
 * Timing lives in Configurator.jsx (useOfferPopups). */

export const COUPON_INR = 2000;

function Perks() {
  return (
    <ul className="grid gap-2 rounded-xl bg-surface p-4 text-sm ring-1 ring-line">
      <li className="flex gap-2.5">
        <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
        <span>A coupon worth <strong className="text-fg">{inr(COUPON_INR)}</strong> off your quotation.</span>
      </li>
      <li className="flex gap-2.5">
        <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
        <span>Found the same configuration cheaper elsewhere? Show us the quote. If we can't beat it, your next <strong className="text-fg">Starbucks coffee</strong> is on us.</span>
      </li>
    </ul>
  );
}

function FinePrint() {
  return (
    <p className="mt-4 text-xs leading-relaxed text-subtle">
      One coupon per customer, applied to your formal quotation and not combinable with other offers.
      The price match needs a written quote for the same unit, drives and RAID level.
    </p>
  );
}

/** Name / company / email / phone. On success calls onDone with the coupon and the details. */
function OfferForm({ source, summary, submitLabel, onDone, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    const details = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      const coupon = await api.offer({ ...details, source, summary });
      onDone({ ...coupon, ...details });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const field = 'field !py-2.5';
  return (
    <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label>
        <span className="mb-1.5 block text-sm text-muted">Your name <span className="text-error">*</span></span>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label>
        <span className="mb-1.5 block text-sm text-muted">Company</span>
        <input name="company" autoComplete="organization" className={field} />
      </label>
      <label>
        <span className="mb-1.5 block text-sm text-muted">Email <span className="text-error">*</span></span>
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label>
        <span className="mb-1.5 block text-sm text-muted">Phone</span>
        <input name="phone" type="tel" autoComplete="tel" className={field} />
      </label>
      {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button disabled={busy} className="btn btn-primary">{busy && <Loader2 className="size-4 animate-spin" />}{submitLabel}</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">No thanks</button>
      </div>
    </form>
  );
}

/** The issued code, big, with a copy button. */
function CouponCode({ offer, note }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard?.writeText(offer.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  return (
    <div className="mt-5 rounded-xl border border-dashed border-accent/50 bg-accent-soft p-5 text-center" role="status">
      <p className="text-sm text-muted">Your coupon: {inr(offer.valueInr ?? COUPON_INR)} off</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-widest text-fg">{offer.code}</p>
      <button type="button" onClick={copy} className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? 'Copied' : 'Copy code'}
      </button>
      <p className="mt-3 text-sm text-muted">{note}</p>
    </div>
  );
}

export function IntroPopup({ open, onClose, offer, onOffer }) {
  return (
    <Dialog open={open} onClose={onClose} title="Not sure which NAS is right for you?">
      <div className="pb-2">
        <p className="text-[0.95rem] leading-relaxed text-muted">
          Tell us what you're storing and we'll tell you honestly which unit fits, and which one you don't need to pay for. No obligation.
        </p>
        <div className="mt-5"><Perks /></div>
        {offer ? (
          <>
            <CouponCode offer={offer} note={`Thanks, ${offer.name.split(' ')[0]}. We'll call you back shortly. Mention this code when you accept your quotation.`} />
            <button type="button" onClick={onClose} className="btn btn-secondary mt-4 w-full">Back to the configurator</button>
          </>
        ) : (
          <OfferForm source="intro" submitLabel="Get my coupon & a call back" onDone={onOffer} onCancel={onClose} />
        )}
        <FinePrint />
      </div>
    </Dialog>
  );
}

export function QuoteOfferPopup({ open, onClose, build, price, summary, offer, onOffer }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!build || !price) return null;

  // Already has a coupon (from the first popup): one click sends this quote with it.
  async function sendWithCoupon() {
    setBusy(true);
    setError('');
    try {
      await api.offer({ name: offer.name, company: offer.company, email: offer.email, phone: offer.phone, source: 'quote', summary });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Your quote is ready: ${inr(COUPON_INR)} off`}>
      <div className="pb-2">
        <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
          <p className="font-medium">{build.units > 1 ? `${build.units} × ` : ''}{build.model.brand} {build.model.model}</p>
          <p className="mt-1 text-sm text-muted">
            {build.drivesPerUnit * build.units} × {build.driveCap} TB {build.driveLine} · {RAID_INFO[build.raid].title} · <span className="whitespace-nowrap">{build.totalUsable} TB usable</span>
          </p>
          <dl className="mt-3 grid gap-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Your quote</dt><dd>{inr(price.total)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Coupon</dt><dd className="text-accent">− {inr(COUPON_INR)}</dd></div>
            <div className="flex items-baseline justify-between gap-3 text-base font-semibold">
              <dt>With your coupon</dt><dd className="text-xl tracking-tight">{inr(Math.max(0, price.total - COUPON_INR))}</dd>
            </div>
          </dl>
          <p className="mt-1 text-right text-xs text-subtle">GST inclusive</p>
        </div>

        {offer ? (
          sent ? (
            <CouponCode offer={offer} note="We've received this configuration with your coupon and will call you back shortly." />
          ) : (
            <>
              <CouponCode offer={offer} note="Your coupon is ready. Send us this configuration and we'll prepare the formal quotation." />
              {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={sendWithCoupon} disabled={busy} className="btn btn-primary">{busy && <Loader2 className="size-4 animate-spin" />}Send me this quote</button>
                <button onClick={onClose} className="btn btn-secondary">No thanks</button>
              </div>
            </>
          )
        ) : (
          <>
            <p className="mt-5 text-sm text-muted">Get your personal coupon code, and we'll send you this configuration as a formal quotation.</p>
            <OfferForm source="quote" summary={summary} submitLabel={`Get my ${inr(COUPON_INR)} coupon`} onDone={(o) => { onOffer(o); setSent(true); }} onCancel={onClose} />
          </>
        )}
        {offer && sent && <button type="button" onClick={onClose} className="btn btn-secondary mt-4 w-full">Back to the configurator</button>}
        <FinePrint />
      </div>
    </Dialog>
  );
}
