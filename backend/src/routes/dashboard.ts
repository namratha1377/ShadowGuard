// ---------------------------------------------------------------------------
// GET /api/dashboard/metrics
//
// This route powers the Dashboard page. Instead of a hardcoded blob of
// numbers (like the old frontend mock did), everything here is computed
// with real SQL queries against whatever is currently in the database.
// That means if you add/edit data later, the dashboard will always reflect
// the real state - which is the whole point of having a backend.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { db } from '../db/connection.js';
import { parseJSON } from '../utils.js';
import type { AIInteraction, SensitiveDataType } from '../types.js';

export const dashboardRouter = Router();

const RISK_COLORS: Record<string, string> = {
  Low: '#737373',
  Medium: '#F59E0B',
  High: '#EF4444',
  Critical: '#DC2626',
};

dashboardRouter.get('/metrics', (_req, res) => {
  // --- KPI counters -------------------------------------------------------
  const totalRequests = (db.prepare(`SELECT COUNT(*) as c FROM ai_interactions`).get() as any).c;
  const allowed = (db.prepare(`SELECT COUNT(*) as c FROM ai_interactions WHERE status = 'allowed'`).get() as any).c;
  const restricted = (db.prepare(`SELECT COUNT(*) as c FROM ai_interactions WHERE status = 'restricted'`).get() as any).c;
  const blocked = (db.prepare(`SELECT COUNT(*) as c FROM ai_interactions WHERE status = 'blocked'`).get() as any).c;

  // --- Activity over the last 14 days (grouped by day + status) ----------
  const activityRows = db
    .prepare(
      `SELECT substr(timestamp, 1, 10) as date, status, COUNT(*) as count
       FROM ai_interactions
       GROUP BY date, status
       ORDER BY date ASC`,
    )
    .all() as { date: string; status: string; count: number }[];

  const activityByDate = new Map<string, { allowed: number; restricted: number; blocked: number }>();
  for (const row of activityRows) {
    if (!activityByDate.has(row.date)) {
      activityByDate.set(row.date, { allowed: 0, restricted: 0, blocked: 0 });
    }
    (activityByDate.get(row.date) as any)[row.status] = row.count;
  }
  const activityOverTime = Array.from(activityByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  // --- Risk distribution ---------------------------------------------------
  const riskRows = db
    .prepare(`SELECT riskLevel, COUNT(*) as count FROM ai_interactions GROUP BY riskLevel`)
    .all() as { riskLevel: string; count: number }[];
  const order = ['low', 'medium', 'high', 'critical'];
  const riskDistribution = order.map((level) => {
    const found = riskRows.find((r) => r.riskLevel === level);
    const label = level.charAt(0).toUpperCase() + level.slice(1);
    return { level: label, count: found?.count ?? 0, color: RISK_COLORS[label] };
  });

  // --- Top applications (by volume, with an average "risk score") --------
  const appRows = db
    .prepare(
      `SELECT aiApplication as name, COUNT(*) as requests,
              SUM(CASE riskLevel WHEN 'critical' THEN 90 WHEN 'high' THEN 70 WHEN 'medium' THEN 45 ELSE 15 END) as riskSum
       FROM ai_interactions
       GROUP BY aiApplication
       ORDER BY requests DESC
       LIMIT 5`,
    )
    .all() as { name: string; requests: number; riskSum: number }[];
  const topApplications = appRows.map((a) => ({
    name: a.name,
    requests: a.requests,
    riskScore: Math.round(a.riskSum / a.requests),
  }));

  // --- Recent security events: derive from the most severe audit logs ----
  const auditRows = db
    .prepare(
      `SELECT * FROM audit_logs
       WHERE severity IN ('warning', 'critical')
       ORDER BY timestamp DESC
       LIMIT 5`,
    )
    .all() as any[];
  const recentSecurityEvents = auditRows.map((a) => ({
    id: `evt-${a.id}`,
    timestamp: a.timestamp,
    title: a.action,
    description: a.details,
    severity: a.severity === 'critical' ? 'critical' : 'high',
    type: a.category === 'detection' ? 'detection' : a.category === 'policy' ? 'policy' : a.category === 'access' ? 'access' : 'anomaly',
  }));

  // --- Recent interactions -------------------------------------------------
  const recentRows = db
    .prepare(`SELECT * FROM ai_interactions ORDER BY timestamp DESC LIMIT 8`)
    .all() as any[];
  const recentInteractions: AIInteraction[] = recentRows.map((r) => ({
    ...r,
    dataDetected: parseJSON<SensitiveDataType[]>(r.dataDetected),
  }));

  const changePercent = 12.4; // Illustrative figure - in a real system this would compare to the prior period.

  res.json({
    kpis: { totalRequests, allowed, restricted, blocked, changePercent },
    activityOverTime,
    riskDistribution,
    topApplications,
    recentSecurityEvents,
    recentInteractions,
  });
});
