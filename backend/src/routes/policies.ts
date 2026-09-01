// ---------------------------------------------------------------------------
// GET  /api/policies         -> list every governance policy
// PATCH /api/policies/:id    -> toggle a policy's enabled/disabled status
//
// PATCH is the one place in this app where the frontend actually writes
// data back to the server (the Policies page has an on/off Toggle per
// policy). This is a good example of a simple "update" endpoint.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';

export const policiesRouter = Router();

policiesRouter.get('/', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM policies ORDER BY name ASC`).all();
  res.json(rows);
});

policiesRouter.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: 'enabled' | 'disabled' };

  if (status !== 'enabled' && status !== 'disabled') {
    return res.status(400).json({ error: "Body must include status: 'enabled' | 'disabled'" });
  }

  const existing = db.prepare(`SELECT * FROM policies WHERE id = ?`).get(id);
  if (!existing) {
    return res.status(404).json({ error: `Policy ${id} not found` });
  }

  const lastUpdated = new Date().toISOString();
  db.prepare(`UPDATE policies SET status = ?, lastUpdated = ? WHERE id = ?`).run(status, lastUpdated, id);

  const updated = db.prepare(`SELECT * FROM policies WHERE id = ?`).get(id);
  res.json(updated);
});
