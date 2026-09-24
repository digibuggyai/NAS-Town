# NASTOWN

NAS storage website: find, configure, rent and maintain the right NAS.

- **client/**: React 19 + Vite + Tailwind CSS v4 + React Router
- **server/**: Node + Express 5 + PostgreSQL (`pg`)
- **Deploy**: a single Railway service. Express serves the API at `/api` and the built React app.

## Run locally

```bash
npm install          # root tooling (concurrently)
npm run install:all  # client + server dependencies
npm run dev          # API on :4000, site on http://localhost:5173
```

Without `DATABASE_URL`, the server uses an in-memory store with the seed products, so no local Postgres is needed. To use Postgres, copy `server/.env.example` to `server/.env` and set `DATABASE_URL`. The schema is applied, and products are seeded, automatically on start.

## Deploy on Railway

1. Create a project, add a **PostgreSQL** database, and add a service from this repo (root directory `/`).
2. On the service, set the variable `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
3. `railway.json` sets `npm run build` (installs dependencies and builds the client) and `npm start`, with a health check at `/api/health`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Status and which store is active |
| GET | `/api/products?brand=&featured=true&rentable=true` | Product list |
| GET | `/api/products/:slug` | Product detail |
| POST | `/api/finder` | `{ storing, capacity, work_style }` → top 3 matches |
| POST | `/api/enquiries` | Leads from every form (`type`: contact, rental, service, configurator, expert) |

Tables: `products`, `enquiries`, `finder_submissions` (see `server/src/db/schema.sql`).

## Where things live

- All page copy, navigation, solutions, services, brands and FAQ: `client/src/data/site.js`
- Colours, fonts and the liquid-glass styles: `client/src/index.css` (`@theme` tokens at the top)
- Homepage sections, in page order: `client/src/sections/`
- Seed products (prices are **indicative placeholders**): `server/src/db/seed.js`
