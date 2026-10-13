# Blog system: technical reference (NASTOWN)

How the NASTOWN blog works end to end, written so it can be rebuilt on another website.
Paths are relative to the NASTOWN repo. Every part named here exists in that code; copy the
files listed in §11 rather than retyping.

---

## 1. What it does

- Staff write posts in a WYSIWYG editor in the admin panel (`/admin/blog`): title, excerpt,
  cover image, category, publish date, web address (slug), published/draft, and a rich
  article body with headings, lists, links, anchors, **inline images**, tables, highlights,
  sub/superscript, code blocks and quotes.
- Paste from Google Docs, Word, web pages or ChatGPT keeps the formatting; Markdown is
  converted; pasted screenshots and dropped image files are uploaded and placed in the text.
- Posts appear on the homepage (latest 3), the blog list (`/resources/blog`) and their own
  page (`/blog/:slug`) with SEO tags, Open Graph cards and `BlogPosting` structured data.
- The HTML is sanitised on the server against an allowlist when saved **and** when served,
  so nothing but formatting can reach a reader's browser.
- Every create / edit / publish / delete / upload is recorded in a permanent change log.

## 2. Stack

| Layer | Used here | Notes for a clone |
|---|---|---|
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, lucide-react icons | Any React app works; the editor needs React 18+ |
| Editor | **Tiptap 3.31.3**: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extensions`, `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/extension-highlight`, `@tiptap/extension-subscript`, `@tiptap/extension-superscript` | **Pin every `@tiptap/*` package to the same exact version.** Mixed versions fail to install (peer-dependency conflict on `@tiptap/core`) |
| API | Node + Express 5, `cors`, `pg` | Any server language; the contract is §5 |
| HTML sanitiser | `sanitize-html` 2.x (server) | Must run on the server, not only in the browser |
| Database | PostgreSQL (Railway); in-memory fallback when `DATABASE_URL` is unset | Images are stored as `BYTEA` (see §12) |
| Hosting | Site on Vercel, API on Railway (two origins) | This is why image URLs need the handling in §7 |

## 3. Architecture

```
Admin (React)                         API (Express)                        Postgres
──────────────                        ─────────────                        ────────
BlogManager.jsx  ── JSON (Bearer) ──▶ /api/admin/blog  (requireBlog) ──▶  blog_posts
  RichEditor.jsx ── raw image bytes ▶ /api/admin/blog/images         ──▶  blog_images (BYTEA)
                                       │  cleanPost() → bodyHtml()  (sanitize-html allowlist)
                                       │  logChanges()  ─────────────────▶ nas_change_log (append-only)
Public site (React)                    │
BlogSection / BlogList / BlogPost ◀── /api/blog, /api/blog/:slug (published only, re-sanitised)
<img src> ◀────────────────────────── /api/blog/images/:id (Cache-Control: immutable, 1 year)
Build (Vite plugin) ◀─────────────── /api/blog?limit=50 → per-post HTML <head>, sitemap, pre-rendered body
```

## 4. Database

```sql
CREATE TABLE IF NOT EXISTS blog_posts (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  category      TEXT,
  body          TEXT NOT NULL DEFAULT '',      -- sanitised HTML (see §6)
  cover_image   TEXT,                          -- "/api/blog/images/12", "/images/…", or an https:// URL
  cover_alt     TEXT,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  published_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts (published, published_at DESC);

-- Uploaded images (covers AND images inside articles) live in the database so they survive redeploys.
CREATE TABLE IF NOT EXISTS blog_images (
  id          SERIAL PRIMARY KEY,
  mime        TEXT NOT NULL,
  data        BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- Columns are snake_case in SQL and camelCase in JSON (`coverImage`, `publishedAt`…).
  `server/src/db/store.js` maps them (`POST_COLS`, `postRow`); `publishedAt` is returned as `YYYY-MM-DD`.
- Store functions: `listPosts({ publishedOnly, limit })` (newest `published_at`, then id),
  `getPost({ id | slug })`, `createPost`, `updatePost` (returns `{ before, after }` for the
  change log), `deletePost`, `saveImage(mime, buffer) → id`, `getImage(id)`,
  `deleteUnusedImage(url)` (deletes an uploaded **cover** once no post uses it).
- Seed: `server/src/db/blog-seed.js` is inserted once into an empty table.

## 5. API contract

All JSON. Admin routes need `Authorization: Bearer <token>` with role `admin` or `blog`.

| Method & path | Auth | Request | Response |
|---|---|---|---|
| `GET /api/blog?limit=N` | public | `limit` ≤ 50 | Published posts, newest first, **without `body`**, plus `readMins`. `Cache-Control: no-cache` |
| `GET /api/blog/:slug` | public | | One published post with sanitised `body` and `readMins`; 404 if missing or draft |
| `GET /api/blog/images/:id` | public | | Image bytes, its `Content-Type`, `Cache-Control: public, max-age=31536000, immutable` |
| `GET /api/admin/blog` | blog | | All posts (drafts too), with body and `readMins` |
| `POST /api/admin/blog` | blog | `{ title*, slug?, excerpt?, category?, body?, coverImage?, coverAlt?, published?, publishedAt? }` | 201 + the post |
| `PATCH /api/admin/blog/:id` | blog | any subset of the above | the updated post |
| `DELETE /api/admin/blog/:id` | blog | | `{ ok: true }` (also deletes its uploaded cover if unused) |
| `POST /api/admin/blog/images` | blog | **raw bytes**, `Content-Type: image/jpeg|png|webp|avif`, ≤ 3 MB | 201 `{ url: "/api/blog/images/12" }` |

Validation (`cleanPost` in `server/src/blog-routes.js`):

- `title` required on create, ≤ 200 chars; `excerpt` ≤ 400; `category` ≤ 60; `coverAlt` ≤ 200; `body` ≤ 200,000 chars.
- `slug`: lower-case, `[a-z0-9-]`, ≤ 80 chars, made from the title if empty; **made unique**
  by appending `-2`, `-3`… (`uniqueSlug`).
- `publishedAt` must be `YYYY-MM-DD`. `published` accepts `true`/`"true"`.
- `coverImage` must match `/images/…`, `/api/blog/images/<id>` or `https://…`.
- `body` is passed through the sanitiser (§6) **before it is stored**, and again when served.
- `readMins = max(1, round(words / 200))`, counted from the body's plain text.

Body-size limit: the server's general `express.json` limit is 100 KB, so the blog admin routes
get their own **1 MB** parser, mounted *before* the general one (`server/src/index.js`).
Long articles with tables fail with "request too large" without this.

Auth (`server/src/auth.js`): HMAC-SHA256-signed token `base64url(claims).signature`, claims
`{ sub, email, role, name, exp }`, 12-hour lifetime, `AUTH_SECRET` env var. `requireBlog =
requireRole('admin', 'blog')`. The `blog` role can only use the blog. Clone with your own auth;
the routes just need a "may edit the blog" check and `req.user.email` for the log.

Change log (`store.logChanges`): one row per changed field, `{ editor, collection: 'blog', itemId,
itemLabel, field, before, after }`. The body is logged as a word count, not the text. In NASTOWN
the log table refuses UPDATE/DELETE (a Postgres trigger). This part is optional for a clone.

## 6. Sanitising (the security boundary)

`server/src/blog-html.js`. Everything the editor can produce must be on this allowlist, or it
is silently removed on save:

```js
allowedTags: ['p','br','h2','h3','h4','strong','em','u','s','a','ul','ol','li','blockquote','hr','code','pre',
              'img','table','thead','tbody','tr','th','td','mark','sub','sup'],
allowedAttributes: { a: ['href','target','rel'], ol: ['start'], img: ['src','alt','title'],
                     th: ['colspan','rowspan'], td: ['colspan','rowspan'],
                     p: ['id'], h2: ['id'], h3: ['id'], h4: ['id'] },
allowedSchemes: ['http','https','mailto','tel'], allowProtocolRelative: false,
```

`transformTags` rules:

- `h1 → h2` (the post title is the page's only h1); `h5/h6 → h4`; `b → strong`; `i → em`; `strike/del → s`.
- `a`: external links (`http(s)://`) get `target="_blank" rel="noopener noreferrer"`; internal
  and `#anchor` links stay as they are.
- `img`: `src` must be **our own** image (`/api/blog/images/<id>` or `/images/…`). A full
  `https://<api host>/api/blog/images/<id>` address is stored as the short path; anything else
  (other sites, `data:` URIs, Word's `file:` images) is dropped. `alt`/`title` capped at 300.
- `id` on `p`/`h2`–`h4` kept only if it matches `^[a-z0-9][a-z0-9-]{0,59}$` (anchors).
- `colspan`/`rowspan` kept only as whole numbers 2–20.
- `exclusiveFilter` drops images that lost their `src`, and empty `p`/`h*`/`li`/`blockquote`.

Not allowed, so always removed: `script`, `style`, `iframe`, `class`, `style=""`, `on*=""` handlers.

Legacy plain-text bodies (from before the rich editor) are converted: a blank line makes a
paragraph and `## ` makes a heading (`legacyToHtml`). A clone can drop this.

## 7. Images (covers and inline)

- **Upload**: the browser sends the file itself as the request body (not multipart), with its
  MIME type as `Content-Type`: `fetch(url, { method: 'POST', headers: { 'Content-Type': file.type,
  Authorization }, body: file })`. The server uses `express.raw({ type: [...IMAGE_TYPES], limit: 3 MB })`.
- **Two origins**: the API (Railway) serves the images, but pages are on Vercel, and Vercel
  does not proxy `/api`. So an image path must be turned into the API's full address before a
  browser can load it:
  - `client/src/lib/api.js` → `mediaUrl(u)`: `"/api/…"` → `${VITE_API_URL}/api/…` (no change in development).
  - `client/src/lib/blogMedia.js` → `withMediaHost(html)` / `withoutMediaHost(html)` rewrite every
    `src="/api/` in article HTML.
- **Rule**: articles **store** the short `/api/blog/images/<id>` path (so they survive an API
  address change); the full address is used only for **display**:
  - Editor: content loaded through `withMediaHost`; `onUpdate` saves `withoutMediaHost(editor.getHTML())`.
  - Public page: `dangerouslySetInnerHTML={{ __html: withMediaHost(post.body) }}`.
  - Covers: `mediaUrl(post.coverImage)` wherever shown.
  - The sanitiser also strips the API host from inline images, as a backstop.
- If your API and site are the **same origin**, `mediaUrl`/`withMediaHost` become no-ops and can go.
- **Pasted images from other websites are removed** (`cleanPastedHtml` in `client/src/lib/pasteFormat.js`
  drops `<img>` whose src isn't ours) so posts never hotlink. The image file itself (screenshot,
  dropped file, Image button) is uploaded instead.

## 8. The editor (`client/src/components/admin/RichEditor.jsx`)

Props: `value` (stored HTML), `onChange(html)`, `onStats({ words, mins })`. The admin form
(`BlogManager.jsx`) lazy-loads it (`React.lazy`), because with tables and images it is ~470 KB.

Extensions:

```js
StarterKit.configure({ heading: { levels: [2, 3, 4] },
                       link: { openOnClick: false, autolink: true, defaultProtocol: 'https' } }),
Anchors,   // custom: global `id` attribute on heading + paragraph, keepOnSplit: false
Image.configure({ inline: false, allowBase64: false }),
TableKit.configure({ table: { resizable: false } }),
Highlight, Subscript, Superscript,
Placeholder.configure({ placeholder: '…' }),
```

`Anchors` must have `keepOnSplit: false`, otherwise pressing Enter copies the id to the next
line and the page gets duplicate anchors.

Toolbar (CKEditor-style, two rows):

| Row 1 | Behaviour |
|---|---|
| Cut / Copy | `document.execCommand('cut'|'copy')` on the editor selection |
| Paste / Paste from Word | `navigator.clipboard.read()`: an image is uploaded, HTML goes through `cleanPastedHtml`, text through the Markdown converter. Needs the browser's clipboard permission; on refusal it tells the user to press Ctrl+V |
| Paste as plain text | `navigator.clipboard.readText()` → paragraphs |
| Undo / Redo | Tiptap history |
| Spell check | Toggles the `spellcheck` attribute on the editable area (browser spell checker) |
| Link / Unlink / Anchor | Link prompt (Ctrl+K; `#name` links to an anchor); Anchor sets a slugged `id` on the current heading/paragraph |
| Image | Hidden file input → upload → `insertContent({ type: 'image', attrs: { src, alt } })`. Alt defaults to the file name; "Image description" edits it |
| Table | `insertTable({ rows: 3, cols: 3, withHeaderRow: true })`; in a table a second bar offers rows/columns above/below/left/right, delete row/column, header row on/off, merge/split cells, delete table |
| Horizontal line, Special characters (₹ © ™ ° × – — … € → ✓ ½ …), Full screen (Esc exits), Source (edit raw HTML; switching back calls `setContent`) | |

| Row 2 | |
|---|---|
| Bold, Italic, Underline, Strike, Remove formatting | |
| Numbered / bulleted list, Outdent / Indent (`liftListItem` / `sinkListItem`, also Shift+Tab / Tab) | |
| Quote | |
| Styles menu | Marker (highlight), inline code, superscript, subscript, clear |
| Format menu | Paragraph, Heading (h2), Subheading (h3), Small heading (h4), Preformatted (code block) |
| Help | Shortcut list |

Paste / drop handling (`editorProps`):

- `transformPastedHTML: cleanPastedHtml`: removes Word comments and `o:p`, rebuilds Word's fake
  bullet lists into real `<ul>/<ol>`, maps `h1→h2` and `h5/h6→h4`, and drops foreign images.
- `handlePaste`: image files are uploaded; plain text that looks like Markdown
  (`looksLikeMarkdown`) is converted with `markdownToHtml` (headings, lists, quotes, code
  fences, bold/italic/strike/code/links, `---`); rich HTML goes through Tiptap's normal paste.
- `handleDrop`: dropped image files are uploaded and inserted where they were dropped
  (`view.posAtCoords`).

WYSIWYG: the editable area has the **same `.prose-blog` class** as the public article, so what
the author sees is what readers get.

## 9. Public pages

| Component | Shows | Data |
|---|---|---|
| `client/src/sections/BlogSection.jsx` | Homepage: latest post large + 2 beside it; hidden when there are none | `GET /api/blog?limit=3` |
| `client/src/components/BlogList.jsx` | `/resources/blog`: all published posts in a grid | `GET /api/blog` |
| `client/src/components/PostCard.jsx` | Card variants: `default`, `feature` ("Latest"), `row`. Cover, category · date · read time, title, excerpt | from the list |
| `client/src/pages/BlogPost.jsx` | `/blog/:slug`: back link, meta line, h1, excerpt, 16:9 cover, sanitised body, "Keep reading" (3 more) | `GET /api/blog/:slug` + `GET /api/blog?limit=4` |

Dates: `formatPostDate` (en-IN, e.g. "13 Oct 2026"). Article styles: the `.prose-blog` block in
`client/src/index.css` (headings, links, lists, quote, code, `hr`, **img** (centred, rounded,
max-width 100%), **table** (full width; scrolls sideways on phones), `mark`, `sub/sup`,
`[id] { scroll-margin-top }` so anchors land below a fixed navbar, plus editor-only
selected-image/cell styles).

## 10. SEO

- `postMeta(post, siteUrl, cover)` (`client/src/lib/seo.js`): `<title>` "Post title | NASTOWN Blog",
  description from the excerpt (clipped to ~158 chars), canonical URL, `og:type=article`,
  Open Graph/Twitter image = the cover, JSON-LD `BreadcrumbList` + `BlogPosting` (headline,
  description, image, datePublished, dateModified, articleSection, author/publisher = the
  organisation).
- Build-time (`client/scripts/seo-plugin.mjs` + `scripts/prerender.mjs`): fetches
  `/api/blog?limit=50`, writes each post's `<head>` into `dist/blog/<slug>/index.html`, adds the
  posts to `sitemap.xml` (with `lastmod`), and pre-renders the article body into the HTML so
  search engines without JavaScript see it. Newly published posts get this on the next deploy;
  until then they are rendered in the browser.

## 11. Files to copy

| File | Role |
|---|---|
| `server/src/blog-routes.js` | Public + admin routes, validation, slugs, image upload, change-log calls |
| `server/src/blog-html.js` | Sanitiser allowlist (`bodyHtml`, `plainText`) |
| `server/src/db/store.js` (blog section: `POST_COLS`, `postRow`, `listPosts` … `deleteUnusedImage`) | Database access |
| `server/src/db/schema.sql` (`blog_posts`, `blog_images`, index) | Tables |
| `server/src/db/blog-seed.js` | Optional starter posts |
| `server/src/index.js` (route mounting + the 1 MB blog JSON parser) | Wiring |
| `server/src/auth.js` (`requireBlog`) | Or your own auth |
| `client/src/components/admin/BlogManager.jsx` | Admin list + post form (cover, alt, category, date, slug, published) |
| `client/src/components/admin/RichEditor.jsx` | The editor |
| `client/src/lib/pasteFormat.js` | Paste cleaning + Markdown converter |
| `client/src/lib/blogMedia.js`, `client/src/lib/api.js` (blog calls, `mediaUrl`, `uploadBlogImage`) | API client + image addresses |
| `client/src/pages/BlogPost.jsx`, `client/src/components/BlogList.jsx`, `client/src/components/PostCard.jsx`, `client/src/sections/BlogSection.jsx` | Public pages |
| `client/src/index.css` (`.prose-blog` block) | Article styles |
| `client/src/lib/seo.js` (`postMeta`) + `client/scripts/seo-plugin.mjs` | SEO (optional) |

## 12. Porting checklist

1. Create the two tables (§4) and the store functions.
2. Mount the routes: public `/api/blog…`, admin `/api/admin/blog…` behind your "can edit blog"
   check; add the **1 MB JSON limit** for the admin blog routes; allow `express.raw` image uploads.
3. Copy `blog-html.js` and keep the allowlist in step with the editor: anything the editor
   produces that isn't allowed is lost on save.
4. Install the client packages, **all `@tiptap/*` at one exact version**
   (`npm install @tiptap/react@3.31.3 @tiptap/pm@3.31.3 … --save-exact`), plus `sanitize-html` on the server.
5. Copy the editor, admin form and public components; replace the Tailwind tokens
   (`bg-surface`, `text-muted`, `border-line`, `accent`…) with your design system, or define them.
6. Decide the image origin: same origin → drop `mediaUrl`/`withMediaHost`; separate API → keep
   them and set `VITE_API_URL` (or your equivalent).
7. CORS: if the API is on another origin, allow the site's origin (`CORS_ORIGIN`).
8. Set `AUTH_SECRET` (or your auth) in production.
9. Wire SEO (`postMeta`) and, if you pre-render, fetch posts at build time.
10. Test: create a post with a heading, anchor + `#link`, an uploaded image, a table, highlight;
    publish; open it publicly; check the image loads from the API host and the table renders.

## 13. Known gaps (worth fixing in a clone)

- **Orphaned inline images**: deleting an image from an article (or deleting the post) does not
  delete its `blog_images` row; only covers are cleaned up (`deleteUnusedImage`). A periodic job
  that deletes images referenced by no post's `cover_image` or `body` would fix it.
- **Images in the database**: fine for a small blog, but `BYTEA` grows the database and every
  view hits the API. For heavy use, move to object storage (S3/R2) behind a CDN and keep the
  same `/api/blog/images/:id` (or a CDN URL) in the HTML.
- **No autosave**: leaving the editor without saving loses changes.
- **Future publish dates** are shown immediately: the public list filters on `published` only,
  not `published_at <= today`.
- **No pagination or search** on the public list (latest 50).
- **Clipboard buttons** depend on browser support and permission (Firefox can't read rich
  clipboard content); keyboard Ctrl+V always works.
- **Oversized requests** on other routes return a generic 500 instead of 413 (general error handler).
- **Pre-rendering** of a new post happens on the next deploy (the post works in the browser
  immediately; search engines that don't run JavaScript see it after the deploy).
