// ---------------------------------------------------------------------------
// SHADOWGUARD backend - entry point.
//
// This file's only job is to:
//   1. Make sure the database exists and has data in it (auto-seed on
//      first run, so you don't have to remember an extra command).
//   2. Set up the Express app: JSON body parsing, CORS (so the Vite dev
//      server on a different port is allowed to call this API), and a
//      health check.
//   3. Mount each resource's routes under /api/...
//
// Run with:  npm run dev   (auto-restarts on file changes, via tsx watch)
// ---------------------------------------------------------------------------

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { db, initSchema } from './db/connection.js';
import { seed } from './db/seed.js';

import { dashboardRouter } from './routes/dashboard.js';
import { interactionsRouter } from './routes/interactions.js';
import { riskRouter } from './routes/risk.js';
import { dataSecurityRouter } from './routes/dataSecurity.js';
import { policiesRouter } from './routes/policies.js';
import { auditLogsRouter } from './routes/auditLogs.js';
import { settingsRouter } from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'shadowguard.db');

// --- 1. Database setup ------------------------------------------------------
initSchema();
const isFreshDatabase = !fs.existsSync(DB_PATH) || (db.prepare(`SELECT COUNT(*) as c FROM ai_interactions`).get() as any).c === 0;
if (isFreshDatabase) {
  console.log('No data found - seeding database with sample data...');
  seed();
}

// --- 2. Express app setup ---------------------------------------------------
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shadowguard-backend', time: new Date().toISOString() });
});

// --- 3. Mount routes ---------------------------------------------------------
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai-interactions', interactionsRouter);
app.use('/api/risk-assessments', riskRouter);
app.use('/api/data-security', dataSecurityRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/settings', settingsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`SHADOWGUARD backend running at http://localhost:${PORT}`);
  console.log(`Accepting requests from frontend origin: ${FRONTEND_ORIGIN}`);
});
