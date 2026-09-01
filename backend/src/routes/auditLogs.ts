// ---------------------------------------------------------------------------
// GET /api/audit-logs
//
// Powers the "Audit Logs" page. Same filter/pagination pattern as
// /api/ai-interactions.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';
import { paginate, parseJSON } from '../utils.js';
import type { AuditLog } from '../types.js';

export const auditLogsRouter = Router();

auditLogsRouter.get('/', (req, res) => {
  const { search, category, severity } = req.query as Record<string, string | undefined>;
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);

  let sql = `SELECT * FROM audit_logs WHERE 1=1`;
  const params: any[] = [];

  if (search) {
    sql += ` AND (LOWER(actor) LIKE ? OR LOWER(action) LIKE ? OR LOWER(resource) LIKE ? OR LOWER(details) LIKE ?)`;
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q, q, q);
  }
  if (category && category !== 'all') {
    sql += ` AND category = ?`;
    params.push(category);
  }
  if (severity && severity !== 'all') {
    sql += ` AND severity = ?`;
    params.push(severity);
  }

  sql += ` ORDER BY timestamp DESC`;

  const rows = db.prepare(sql).all(...params) as any[];
  const logs: AuditLog[] = rows.map((r) => ({
    ...r,
    metadata: parseJSON<Record<string, string>>(r.metadata),
  }));

  res.json(paginate(logs, page, pageSize));
});
