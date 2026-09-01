// ---------------------------------------------------------------------------
// GET /api/ai-interactions
//
// Powers the "AI Activity" page. Supports the same filters the frontend
// already sends: free-text search, status, riskLevel, a date range, and
// pagination (page/pageSize).
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';
import { paginate, parseJSON } from '../utils.js';
import type { AIInteraction, SensitiveDataType } from '../types.js';

export const interactionsRouter = Router();

interactionsRouter.get('/', (req, res) => {
  const { search, status, riskLevel, dateFrom, dateTo } = req.query as Record<string, string | undefined>;
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);

  let sql = `SELECT * FROM ai_interactions WHERE 1=1`;
  const params: any[] = [];

  if (search) {
    sql += ` AND (LOWER(user) LIKE ? OR LOWER(aiApplication) LIKE ? OR LOWER(promptSummary) LIKE ? OR LOWER(policy) LIKE ?)`;
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q, q, q);
  }
  if (status && status !== 'all') {
    sql += ` AND status = ?`;
    params.push(status);
  }
  if (riskLevel && riskLevel !== 'all') {
    sql += ` AND riskLevel = ?`;
    params.push(riskLevel);
  }
  if (dateFrom) {
    sql += ` AND timestamp >= ?`;
    params.push(new Date(dateFrom).toISOString());
  }
  if (dateTo) {
    sql += ` AND timestamp <= ?`;
    params.push(new Date(dateTo).toISOString());
  }

  sql += ` ORDER BY timestamp DESC`;

  const rows = db.prepare(sql).all(...params) as any[];
  const interactions: AIInteraction[] = rows.map((r) => ({
    ...r,
    dataDetected: parseJSON<SensitiveDataType[]>(r.dataDetected),
  }));

  res.json(paginate(interactions, page, pageSize));
});
