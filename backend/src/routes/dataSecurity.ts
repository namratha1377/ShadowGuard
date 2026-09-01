// ---------------------------------------------------------------------------
// GET /api/data-security
//
// Powers the "Data Security" page: counts of detections by data type,
// the most recent individual detections, and a 14-day trend.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';

export const dataSecurityRouter = Router();

const DATA_TYPES = ['PII', 'Source Code', 'Financial', 'Confidential Documents'];

dataSecurityRouter.get('/', (_req, res) => {
  const byType = db
    .prepare(`SELECT dataType, COUNT(*) as count FROM sensitive_data_detections GROUP BY dataType`)
    .all() as { dataType: string; count: number }[];

  const detectionsByType = DATA_TYPES.map((type) => ({
    type,
    count: byType.find((b) => b.dataType === type)?.count ?? 0,
    trend: 0, // Would come from comparing to a prior period in a real system.
  }));

  const recentDetections = db
    .prepare(`SELECT * FROM sensitive_data_detections ORDER BY timestamp DESC LIMIT 10`)
    .all();

  // Derive a 14-day trend for each data type from ai_interactions.dataDetected,
  // since that's where sensitive-data flags actually get attached day to day.
  const rows = db
    .prepare(`SELECT substr(timestamp, 1, 10) as date, dataDetected FROM ai_interactions`)
    .all() as { date: string; dataDetected: string }[];

  const byDate = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const detected: string[] = JSON.parse(row.dataDetected);
    if (detected.length === 0) continue;
    if (!byDate.has(row.date)) byDate.set(row.date, { PII: 0, 'Source Code': 0, Financial: 0, 'Confidential Documents': 0 });
    const bucket = byDate.get(row.date)!;
    for (const d of detected) bucket[d] = (bucket[d] ?? 0) + 1;
  }
  const trendOverTime = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  res.json({ detectionsByType, recentDetections, trendOverTime });
});
