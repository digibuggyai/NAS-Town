import { prerenderToNodeStream } from 'react-dom/static';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App.jsx';

const page = (url) => (
  <StaticRouter location={url}>
    <App />
  </StaticRouter>
);

async function warm(url) {
  const { prelude } = await prerenderToNodeStream(page(url));
  for await (const chunk of prelude) void chunk;
}

const incomplete = (html) => html.includes('<!--$!-->') || html.includes('<!--$?-->') || html.includes('<template');

export async function render(url) {
  for (let i = 0; i < 3; i++) {
    await warm(url);
    const html = renderToString(page(url));
    if (!incomplete(html)) return html;
  }
  throw new Error('part of the page was still loading after 3 passes');
}
