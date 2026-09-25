import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import * as store from './db/store.js';
import api from './routes.js';
import admin from './admin-routes.js';
import { bootstrapAdmin } from './auth.js';

const app = express();
const port = process.env.PORT || 4000;
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '100kb' }));
app.set('trust proxy', 1); // Railway sits behind a proxy; needed for per-IP login throttling
app.use('/api/admin', admin);
app.use('/api', api);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// In production the built React app is served from the same Railway service.
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side.' });
});

await store.init();
await bootstrapAdmin();
app.listen(port, () => console.log(`[server] NASTOWN API on http://localhost:${port}`));
