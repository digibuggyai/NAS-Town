// Build-time renderer (scripts/prerender.mjs): one public page to HTML.
import { prerenderToNodeStream } from 'react-dom/static';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App.jsx';

const page = (url) => (
  <StaticRouter location={url}>
    <App />
  </StaticRouter>
);

/** Waits until every lazily loaded part of the page has its code loaded. */
async function warm(url) {
  const { prelude } = await prerenderToNodeStream(page(url));
  for await (const chunk of prelude) void chunk; // drain; only the loading matters
}

// Anything still loading would come out as a placeholder ($!) or as a hidden block swapped in by
// an inline script, which never runs without JavaScript. Once warm, renderToString draws the
// whole page in one go; the prerender output itself keeps those swap blocks, so it isn't used.
const incomplete = (html) => html.includes('<!--$!-->') || html.includes('<!--$?-->') || html.includes('<template');

export async function render(url) {
  for (let i = 0; i < 3; i++) {
    await warm(url);
    const html = renderToString(page(url));
    if (!incomplete(html)) return html;
  }
  throw new Error('part of the page was still loading after 3 passes');
}
