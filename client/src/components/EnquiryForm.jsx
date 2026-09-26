import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';

// Shared lead form. `type` maps to enquiries.type on the server; `payload` carries
// context (selected service, configuration, rental details) and `extra` renders
// additional fields whose values are merged into the payload.
export default function EnquiryForm({ type = 'contact', payload = {}, extra, submitLabel = 'Send Enquiry', title, className = '' }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { name, email, phone, message, ...rest } = Object.fromEntries(form);
    setStatus('sending');
    setError('');
    try {
      await api.enquire({ type, name, email, phone, message, payload: { ...payload, ...rest, page: location.pathname } });
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div className={`glass rounded-xl p-8 text-center ${className}`}>
        <CheckCircle2 className="mx-auto size-10 text-accent" />
        <h3 className="mt-4 text-xl font-semibold">Thanks, we've got it.</h3>
        <p className="mt-2 text-muted">Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`glass rounded-xl p-6 sm:p-8 ${className}`}>
      {title && <h3 className="mb-6 text-xl font-semibold">{title}</h3>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted">Name</span>
          <input name="name" required autoComplete="name" className="field" placeholder="Your name" />
        </label>
        <label>
          <span className="mb-1.5 block text-sm text-muted">Email</span>
          <input name="email" type="email" autoComplete="email" className="field" placeholder="you@example.com" />
        </label>
        <label>
          <span className="mb-1.5 block text-sm text-muted">Phone / WhatsApp</span>
          <input name="phone" type="tel" autoComplete="tel" className="field" placeholder="+91" />
        </label>
        {extra}
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm text-muted">What do you need?</span>
          <textarea name="message" rows={4} className="field resize-none" placeholder="Tell us what you want to store, your setup, or the problem you're facing." />
        </label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
      <button disabled={status === 'sending'} className="btn btn-primary mt-6 w-full sm:w-auto">
        {status === 'sending' && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
