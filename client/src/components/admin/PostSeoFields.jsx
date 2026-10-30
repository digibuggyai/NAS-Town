import { Plus, Trash2 } from 'lucide-react';

/* Admin → Blog → post editor: the SEO and schema fields under the article.
 *  - Meta title / description / keywords: what search engines show. Empty = title / excerpt.
 *  - FAQs: printed at the end of the post and sent as FAQPage schema.
 *  - Custom schema: any extra JSON-LD (HowTo, Product, VideoObject…). Checked here as you type
 *    and again on the server; BlogPosting and breadcrumb schema are always added automatically. */

const TEMPLATES = {
  HowTo: {
    '@type': 'HowTo',
    name: 'How to set up a NAS',
    totalTime: 'PT30M',
    step: [
      { '@type': 'HowToStep', name: 'Install the drives', text: 'Slide each drive into a bay and lock it.' },
      { '@type': 'HowToStep', name: 'Connect to the network', text: 'Plug the NAS into your router and power it on.' },
    ],
  },
  Product: {
    '@type': 'Product',
    name: 'Synology DS925+',
    brand: { '@type': 'Brand', name: 'Synology' },
    offers: { '@type': 'Offer', priceCurrency: 'INR', price: '95000', availability: 'https://schema.org/InStock' },
  },
  VideoObject: {
    '@type': 'VideoObject',
    name: 'RAID explained in 60 seconds',
    description: 'What RAID 1, 5 and 6 mean for your data.',
    thumbnailUrl: 'https://nastown.com/og-image.png',
    uploadDate: '2026-10-30',
    contentUrl: 'https://www.instagram.com/reel/XXXXXXXXX/',
  },
  ItemList: {
    '@type': 'ItemList',
    name: 'Best NAS for photographers',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Synology DS925+' },
      { '@type': 'ListItem', position: 2, name: 'QNAP TS-464-8G' },
    ],
  },
};

/** Problems with the custom schema, or '' when it's fine (or empty). Mirrors the server check. */
export function schemaProblem(raw) {
  const t = (raw ?? '').trim();
  if (!t) return '';
  let d;
  try { d = JSON.parse(t); } catch (e) { return `Not valid JSON: ${e.message}`; }
  const list = Array.isArray(d) ? d : d?.['@graph'] ?? [d];
  if (!list.length || list.some((x) => !x || typeof x !== 'object' || Array.isArray(x) || !x['@type'])) return 'Each schema needs an "@type".';
  return '';
}

function Counter({ value, ideal }) {
  const n = (value ?? '').length;
  return <span className={n > ideal ? 'text-warning' : 'text-subtle'}>{n}/{ideal}</span>;
}

export default function PostSeoFields({ f, set, siteUrl }) {
  const faqs = f.faqs ?? [];
  const setFaq = (i, patch) => set({ faqs: faqs.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const problem = schemaProblem(f.schemaJson);

  function addTemplate(name) {
    let list = [];
    const t = (f.schemaJson ?? '').trim();
    if (t && !schemaProblem(t)) { const d = JSON.parse(t); list = Array.isArray(d) ? d : [d]; }
    list.push({ '@context': 'https://schema.org', ...TEMPLATES[name] });
    set({ schemaJson: JSON.stringify(list.length === 1 ? list[0] : list, null, 2) });
  }

  // What the Google result will roughly look like.
  const shownTitle = f.metaTitle || (f.title ? `${f.title} | NASTOWN Blog` : 'Post title | NASTOWN Blog');
  const shownDesc = f.metaDescription || f.excerpt || 'The excerpt is used until you write a meta description.';

  return (
    <div className="grid gap-6">
      <fieldset className="panel grid gap-4 p-5">
        <legend className="px-1 text-sm font-semibold">SEO</legend>
        <label>
          <span className="mb-1 flex justify-between text-sm text-muted">Meta title <Counter value={f.metaTitle} ideal={60} /></span>
          <input value={f.metaTitle ?? ''} onChange={(e) => set({ metaTitle: e.target.value })} maxLength={120} className="field !py-2 text-sm" placeholder={f.title ? `${f.title} | NASTOWN Blog` : 'Leave empty to use the post title'} />
        </label>
        <label>
          <span className="mb-1 flex justify-between text-sm text-muted">Meta description <Counter value={f.metaDescription} ideal={160} /></span>
          <textarea rows={2} value={f.metaDescription ?? ''} onChange={(e) => set({ metaDescription: e.target.value })} maxLength={320} className="field resize-y text-sm" placeholder="Leave empty to use the excerpt" />
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">Meta keywords <span className="text-subtle">(comma separated)</span></span>
          <input value={f.metaKeywords ?? ''} onChange={(e) => set({ metaKeywords: e.target.value })} maxLength={300} className="field !py-2 text-sm" placeholder="e.g. NAS for photographers, RAID 5, Synology DS925+" />
        </label>
        <div className="rounded-xl bg-surface p-4">
          <p className="text-xs text-subtle">Google preview</p>
          <p className="mt-1 truncate text-xs text-muted">{siteUrl.replace(/^https?:\/\//, '')} › blog › {f.slug || 'post'}</p>
          <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{shownTitle}</p>
          <p className="line-clamp-2 text-sm text-muted">{shownDesc}</p>
        </div>
      </fieldset>

      <fieldset className="panel grid gap-4 p-5">
        <legend className="px-1 text-sm font-semibold">Schema</legend>
        <p className="text-sm text-muted">BlogPosting and breadcrumb schema are added to every post automatically. Add FAQs or extra schema below.</p>

        <div>
          <p className="mb-2 text-sm font-medium">FAQs <span className="font-normal text-subtle">(shown at the end of the post, sent as FAQPage schema)</span></p>
          <div className="grid gap-3">
            {faqs.map((x, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-line p-3">
                <div className="flex gap-2">
                  <input value={x.q} onChange={(e) => setFaq(i, { q: e.target.value })} maxLength={300} className="field !py-2 text-sm" placeholder={`Question ${i + 1}`} />
                  <button type="button" onClick={() => set({ faqs: faqs.filter((_, j) => j !== i) })} aria-label={`Remove question ${i + 1}`} className="rounded-full p-2 text-subtle hover:bg-error/10 hover:text-error"><Trash2 className="size-4" /></button>
                </div>
                <textarea rows={2} value={x.a} onChange={(e) => setFaq(i, { a: e.target.value })} maxLength={3000} className="field resize-y text-sm" placeholder="Answer" />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set({ faqs: [...faqs, { q: '', a: '' }] })} className="btn btn-secondary !mt-3 !py-1.5 !text-xs"><Plus className="size-3.5" /> Add FAQ</button>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Custom schema <span className="font-normal text-subtle">(JSON-LD)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(TEMPLATES).map((t) => (
                <button key={t} type="button" onClick={() => addTemplate(t)} className="chip !py-1 !text-xs">+ {t}</button>
              ))}
            </div>
          </div>
          <textarea
            rows={8}
            spellCheck={false}
            value={f.schemaJson ?? ''}
            onChange={(e) => set({ schemaJson: e.target.value })}
            className={`field mono resize-y !text-xs ${problem ? '!border-error' : ''}`}
            placeholder={'{\n  "@type": "HowTo",\n  "name": "…"\n}'}
          />
          <p className={`mt-1 text-xs ${problem ? 'text-error' : 'text-subtle'}`}>
            {problem || 'Use a template above or paste JSON-LD. Check it with Google’s Rich Results Test after publishing.'}
          </p>
        </div>
      </fieldset>
    </div>
  );
}
