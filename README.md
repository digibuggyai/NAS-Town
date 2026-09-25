# NASTOWN

NAS storage website: find, configure, rent and maintain the right NAS.

- **client/**: React 19 + Vite + Tailwind CSS v4 + GSAP, deployed to **Vercel** (root directory `client`)
- **server/**: Node + Express 5 + PostgreSQL, deployed to **Railway**
- **Configurator engine**: `client/src/lib/nas/` (pure JS: `logic.js`, `configure.js`, `specs.js`), ported from the NAS configurator spec

## Run locally

```bash
npm install          # root tooling (concurrently)
npm run install:all  # client + server dependencies
npm run dev          # API on :4000, site on http://localhost:5173
```

Without `DATABASE_URL` the server uses an in-memory store seeded from `server/src/db/catalogue.js`, and prints a
dev admin login to the console. Staff area: http://localhost:5173/admin

Engine tests (the spec's worked examples and invariants): `cd server && npm test`

## Floor prices (internal)

Floor (minimum) prices must never reach a browser.

- They are **not in git**. They live in `server/src/db/floors.local.json`, which is gitignored. Keep that file private.
- The public route `GET /api/nas-pricing` is built field by field and never reads a floor. Only the staff routes include them.
- To load floors into a database (for example Railway's), run from `server/`:
  `DATABASE_URL=<railway public connection url> npm run import-floors`
- They can also be edited in the admin panel (amber columns).

## Deploy

**Railway (API + Postgres)**: add a PostgreSQL database and a service from this repo. Set these variables on the service:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `AUTH_SECRET` | a long random string (signs staff sessions) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | the first admin, created on start if no admin exists |
| `CORS_ORIGIN` | optional, e.g. `https://nas-town.vercel.app` |

The schema is applied and the catalogue seeded on first start. Then run `import-floors` once (see above).

**Vercel (site)**: root directory `client`, Vite preset. Set `VITE_API_URL` to the Railway URL (no `/api`).
`client/vercel.json` rewrites deep links such as `/products` and `/admin` to the app.

## API

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/api/nas-pricing` | anyone | Public price list for the configurator (no floors). 503 if incomplete |
| GET | `/api/products[/:slug]` | anyone | Catalogue as product cards for the site |
| POST | `/api/enquiries` | anyone | Leads from every form, including configurator quotes |
| POST | `/api/finder` | anyone | Logs NAS Finder answers and what was recommended |
| POST | `/api/auth/login` | anyone | Staff sign-in, returns a bearer token |
| GET | `/api/admin/nas/pricing` | admin, sales | Same shape as the public list, with floors |
| GET | `/api/admin/nas` | admin | Full catalogue including hidden items and floors |
| POST, PATCH, DELETE | `/api/admin/nas/:collection[/:id]` | admin | Edit `models`, `drives`, `driveLines`, `upgrades` |
| PATCH | `/api/admin/nas/settings` | admin | Installation and AMC |
| GET | `/api/admin/change-log` | admin | Every edit, with editor, before and after |
| GET | `/api/admin/price-sheet.csv` | admin | Internal price sheet with floors |
| GET, POST, DELETE | `/api/admin/users` | admin | Staff accounts (admin or sales) |
| GET | `/api/admin/enquiries` | admin, sales | Leads |

## Where things live

- Page copy, navigation, solutions, services and FAQ: `client/src/data/site.js`
- Colours, fonts and the liquid-glass styles: `client/src/index.css`
- Motion (GSAP, Lenis, magnetic and tilt effects): `client/src/lib/motion.js`
- Configurator UI: `client/src/components/configurator/`. Staff area: `client/src/pages/admin/`
- Catalogue seed (quote prices only): `server/src/db/catalogue.js`
