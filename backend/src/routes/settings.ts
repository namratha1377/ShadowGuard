// ---------------------------------------------------------------------------
// Settings routes, all under /api/settings/...
//
// Each of these tables holds exactly one row (id = 1) storing a JSON blob -
// simplest way to persist a handful of single-record "settings" objects
// without over-engineering the schema.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';

export const settingsRouter = Router();

function getBlob(table: string) {
  const row = db.prepare(`SELECT data FROM ${table} WHERE id = 1`).get() as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

settingsRouter.get('/organization', (_req, res) => {
  res.json(getBlob('organization_settings'));
});

settingsRouter.get('/governance', (_req, res) => {
  res.json(getBlob('governance_preferences'));
});

settingsRouter.get('/notifications', (_req, res) => {
  res.json(getBlob('notification_preferences'));
});

settingsRouter.get('/user', (_req, res) => {
  res.json(getBlob('user_profile'));
});
