// ---------------------------------------------------------------------------
// GET /api/risk-assessments
//
// Powers the "Risk Assessment" page: a summary (counts by level + a 14-day
// trend + top contributing factors) plus a list of individual assessments.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';
import { parseJSON } from '../utils.js';

export const riskRouter = Router();

riskRouter.get('/', (_req, res) => {
  const counts = db
    .prepare(`SELECT riskLevel, COUNT(*) as count FROM ai_interactions GROUP BY riskLevel`)
    .all() as { riskLevel: string; count: number }[];
  const get = (level: string) => counts.find((c) => c.riskLevel === level)?.count ?? 0;

  const low = get('low');
  const medium = get('medium');
  const high = get('high');
  const critical = get('critical');
  const total = low + medium + high + critical;

  // 14-day trend, grouped by day + risk level.
  const trendRows = db
    .prepare(
      `SELECT substr(timestamp, 1, 10) as date, riskLevel, COUNT(*) as count
       FROM ai_interactions
       GROUP BY date, riskLevel
       ORDER BY date ASC`,
    )
    .all() as { date: string; riskLevel: string; count: number }[];

  const trendByDate = new Map<string, { low: number; medium: number; high: number; critical: number }>();
  for (const row of trendRows) {
    if (!trendByDate.has(row.date)) trendByDate.set(row.date, { low: 0, medium: 0, high: 0, critical: 0 });
    (trendByDate.get(row.date) as any)[row.riskLevel] = row.count;
  }
  const trend = Array.from(trendByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  // Top contributing factors, aggregated across all stored risk assessments.
  const factorRows = db.prepare(`SELECT factors FROM risk_assessments`).all() as { factors: string }[];
  const factorCounts = new Map<string, number>();
  for (const row of factorRows) {
    const factors = parseJSON<string[]>(row.factors);
    for (const f of factors) factorCounts.set(f, (factorCounts.get(f) ?? 0) + 1);
  }
  const topFactors = Array.from(factorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([factor, count]) => ({ factor, count, trend: 'stable' as const }));

  const assessmentRows = db
    .prepare(`SELECT * FROM risk_assessments ORDER BY timestamp DESC LIMIT 15`)
    .all() as any[];
  const assessments = assessmentRows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    user: r.user,
    aiApplication: r.aiApplication,
    requestType: r.requestType,
    riskLevel: r.riskLevel,
    riskScore: r.riskScore,
    factors: parseJSON<string[]>(r.factors),
    dataDetected: parseJSON(r.dataDetected),
    status: r.status,
  }));

  res.json({
    summary: { low, medium, high, critical, total, trend, topFactors },
    assessments,
  });
});
