// ---------------------------------------------------------------------------
// SEED SCRIPT
// ---------------------------------------------------------------------------
// This is a one-time (or "run whenever you want a fresh start") script that
// fills the SQLite database with realistic sample data, so the dashboard
// isn't empty the first time you open it.
//
// It's a direct port of the random-data generator that used to live in
// `frontend/src/data/mockData.ts` - except now the data actually lives in
// a database table instead of being recreated from scratch on every page
// load. That's the core idea of "adding a backend": the frontend no longer
// invents data, it just asks the server for it.
//
// Run it with:   npm run seed
// (this also happens automatically the first time you start the server,
// see src/index.ts)
// ---------------------------------------------------------------------------

import { db, initSchema } from './connection.js';

type GovernanceStatus = 'allowed' | 'restricted' | 'blocked';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const users = [
  { name: 'Sarah Chen', department: 'Engineering' },
  { name: 'Marcus Johnson', department: 'Finance' },
  { name: 'Elena Rodriguez', department: 'Legal' },
  { name: 'David Kim', department: 'Product' },
  { name: 'Amanda Foster', department: 'HR' },
  { name: 'James Wright', department: 'Sales' },
  { name: 'Priya Patel', department: 'Engineering' },
  { name: 'Robert Hayes', department: 'Operations' },
  { name: 'Lisa Thompson', department: 'Marketing' },
  { name: "Michael O'Brien", department: 'Security' },
];

const apps = ['ChatGPT', 'Microsoft Copilot', 'Gemini', 'Claude', 'Perplexity', 'GitHub Copilot'];
const requestTypes = [
  'Code Assistance',
  'Summarization',
  'Document Analysis',
  'Data Analysis',
  'Content Generation',
] as const;
const dataTypes = ['PII', 'Source Code', 'Financial', 'Confidential Documents'] as const;
const policyNames = [
  'Enterprise AI Usage Policy',
  'PII Data Protection',
  'Source Code Guard',
  'Financial Data Restriction',
  'Confidential Document Block',
  'Third-Party AI Allowlist',
];

const promptSummaries = [
  'Analyze quarterly revenue projections for Q3',
  'Summarize vendor contract terms and liability clauses',
  'Generate Python script for data pipeline automation',
  'Review employee performance evaluation template',
  'Extract key metrics from financial spreadsheet',
  'Draft marketing copy for product launch campaign',
  'Debug authentication middleware implementation',
  'Compare competitor pricing strategies in SaaS market',
];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

interface SeedInteraction {
  id: string;
  timestamp: string;
  user: string;
  department: string;
  aiApplication: string;
  requestType: string;
  riskLevel: RiskLevel;
  dataDetected: string[];
  policy: string;
  status: GovernanceStatus;
  promptSummary: string;
}

function generateInteractions(count: number): SeedInteraction[] {
  const statuses: GovernanceStatus[] = ['allowed', 'allowed', 'allowed', 'restricted', 'blocked'];
  const risks: RiskLevel[] = ['low', 'low', 'medium', 'high', 'critical'];
  const interactions: SeedInteraction[] = [];

  for (let i = 0; i < count; i++) {
    const user = randomFrom(users);
    const status = randomFrom(statuses);
    const riskLevel = status === 'blocked' ? randomFrom(['high', 'critical'] as const) : randomFrom(risks);
    const detected = riskLevel === 'low' ? [] : [randomFrom(dataTypes)];

    interactions.push({
      id: `int-${String(i + 1).padStart(4, '0')}`,
      timestamp: daysAgo(Math.floor(i / 8), i % 24),
      user: user.name,
      department: user.department,
      aiApplication: randomFrom(apps),
      requestType: randomFrom(requestTypes),
      riskLevel,
      dataDetected: detected,
      policy: randomFrom(policyNames),
      status,
      promptSummary: promptSummaries[i % promptSummaries.length],
    });
  }

  return interactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function riskScoreFor(level: RiskLevel): number {
  switch (level) {
    case 'critical':
      return 92 + Math.floor(Math.random() * 8);
    case 'high':
      return 75 + Math.floor(Math.random() * 15);
    case 'medium':
      return 45 + Math.floor(Math.random() * 25);
    default:
      return 10 + Math.floor(Math.random() * 20);
  }
}

function factorsFor(i: SeedInteraction): string[] {
  const factors: string[] = [];
  if (i.dataDetected.length > 0) factors.push(`Sensitive data detected: ${i.dataDetected.join(', ')}`);
  if (i.requestType === 'Code Assistance') factors.push('Source code context identified');
  if (i.aiApplication === 'ChatGPT') factors.push('Non-enterprise AI endpoint');
  factors.push('User not in approved AI group');
  return factors.slice(0, 3);
}

const sensitiveDetections = [
  {
    id: 'det-001', timestamp: daysAgo(0, 2), dataType: 'PII', severity: 'high',
    aiApplication: 'ChatGPT', user: 'Marcus Johnson', actionTaken: 'blocked',
    description: 'Social Security Number pattern detected in prompt text', pattern: 'SSN: XXX-XX-XXXX',
  },
  {
    id: 'det-002', timestamp: daysAgo(0, 5), dataType: 'Source Code', severity: 'critical',
    aiApplication: 'GitHub Copilot', user: 'Sarah Chen', actionTaken: 'restricted',
    description: 'Proprietary authentication module source code pasted into prompt', pattern: 'Internal repo: auth-service/v2',
  },
  {
    id: 'det-003', timestamp: daysAgo(1, 3), dataType: 'Financial', severity: 'high',
    aiApplication: 'Microsoft Copilot', user: 'Marcus Johnson', actionTaken: 'blocked',
    description: 'Unredacted revenue figures and EBITDA data in document upload', pattern: 'Financial statement Q2 2026',
  },
  {
    id: 'det-004', timestamp: daysAgo(1, 8), dataType: 'Confidential Documents', severity: 'critical',
    aiApplication: 'Claude', user: 'Elena Rodriguez', actionTaken: 'blocked',
    description: 'Attorney-client privileged communication submitted for summarization', pattern: 'Legal brief — Case #2026-L-4892',
  },
  {
    id: 'det-005', timestamp: daysAgo(2, 1), dataType: 'PII', severity: 'medium',
    aiApplication: 'Gemini', user: 'Amanda Foster', actionTaken: 'restricted',
    description: 'Employee records with names and email addresses detected', pattern: 'HR employee directory export',
  },
  {
    id: 'det-006', timestamp: daysAgo(2, 6), dataType: 'Source Code', severity: 'high',
    aiApplication: 'ChatGPT', user: 'Priya Patel', actionTaken: 'blocked',
    description: 'API keys and database connection strings in code snippet', pattern: 'AWS credentials in config file',
  },
  {
    id: 'det-007', timestamp: daysAgo(3, 2), dataType: 'Financial', severity: 'medium',
    aiApplication: 'Perplexity', user: 'James Wright', actionTaken: 'restricted',
    description: 'Customer pricing tiers and discount schedules referenced', pattern: 'Sales pricing matrix 2026',
  },
  {
    id: 'det-008', timestamp: daysAgo(3, 9), dataType: 'Confidential Documents', severity: 'high',
    aiApplication: 'Microsoft Copilot', user: 'David Kim', actionTaken: 'restricted',
    description: 'Unreleased product roadmap document shared for analysis', pattern: 'Product roadmap — Confidential',
  },
  {
    id: 'det-009', timestamp: daysAgo(4, 4), dataType: 'PII', severity: 'low',
    aiApplication: 'Claude', user: 'Lisa Thompson', actionTaken: 'allowed',
    description: 'Generic email format detected — no specific identifiers matched', pattern: 'Email address pattern',
  },
  {
    id: 'det-010', timestamp: daysAgo(5, 1), dataType: 'Financial', severity: 'critical',
    aiApplication: 'ChatGPT', user: 'Robert Hayes', actionTaken: 'blocked',
    description: 'M&A due diligence financials uploaded for analysis', pattern: 'Acquisition target financials',
  },
];

const policies = [
  { id: 'pol-001', name: 'Enterprise AI Usage Policy', description: 'Baseline policy governing all AI tool usage across the organization. Requires approved applications and audit logging.', scope: 'Organization-wide', status: 'enabled', lastUpdated: daysAgo(14), rules: 12, violations: 23 },
  { id: 'pol-002', name: 'PII Data Protection', description: 'Blocks transmission of personally identifiable information including SSN, passport numbers, and health records to external AI services.', scope: 'All departments', status: 'enabled', lastUpdated: daysAgo(7), rules: 8, violations: 15 },
  { id: 'pol-003', name: 'Source Code Guard', description: 'Prevents upload of proprietary source code, API keys, and credentials to non-approved AI coding assistants.', scope: 'Engineering, Product', status: 'enabled', lastUpdated: daysAgo(3), rules: 6, violations: 8 },
  { id: 'pol-004', name: 'Financial Data Restriction', description: 'Restricts sharing of financial statements, revenue data, and pricing information with external AI platforms.', scope: 'Finance, Sales, Operations', status: 'enabled', lastUpdated: daysAgo(21), rules: 5, violations: 11 },
  { id: 'pol-005', name: 'Confidential Document Block', description: 'Blocks attorney-client privileged documents, board materials, and classified internal communications.', scope: 'Legal, Executive', status: 'enabled', lastUpdated: daysAgo(5), rules: 4, violations: 6 },
  { id: 'pol-006', name: 'Third-Party AI Allowlist', description: 'Maintains approved list of AI applications permitted for enterprise use. All others are blocked by default.', scope: 'Organization-wide', status: 'enabled', lastUpdated: daysAgo(1), rules: 3, violations: 42 },
  { id: 'pol-007', name: 'Marketing Content Generation', description: 'Allows content generation for marketing materials with brand compliance checks. Restricts competitor analysis data.', scope: 'Marketing', status: 'enabled', lastUpdated: daysAgo(30), rules: 4, violations: 2 },
  { id: 'pol-008', name: 'HR Data Processing', description: 'Governs use of AI for HR workflows including resume screening and employee communications.', scope: 'HR', status: 'disabled', lastUpdated: daysAgo(45), rules: 5, violations: 0 },
];

const auditLogs = [
  { id: 'aud-001', timestamp: daysAgo(0, 1), actor: "Michael O'Brien", action: 'Policy Updated', resource: 'PII Data Protection', category: 'policy', severity: 'info', ipAddress: '10.0.12.45', details: 'Updated detection rules to include passport number patterns for EU compliance.', metadata: { policyId: 'pol-002', changeType: 'rule_addition' } },
  { id: 'aud-002', timestamp: daysAgo(0, 3), actor: 'System', action: 'Critical Detection', resource: 'ChatGPT Interaction', category: 'detection', severity: 'critical', ipAddress: '10.0.8.112', details: 'Blocked request containing SSN data from Finance department user.', metadata: { interactionId: 'int-0003', userId: 'marcus.johnson' } },
  { id: 'aud-003', timestamp: daysAgo(0, 6), actor: 'Sarah Chen', action: 'Access Denied', resource: 'GitHub Copilot', category: 'access', severity: 'warning', ipAddress: '10.0.15.78', details: 'Attempted to use non-approved AI application. Request redirected to approved alternative.', metadata: { application: 'GitHub Copilot', approvedAlternative: 'Microsoft Copilot' } },
  { id: 'aud-004', timestamp: daysAgo(1, 2), actor: "Michael O'Brien", action: 'Configuration Changed', resource: 'Governance Settings', category: 'configuration', severity: 'info', ipAddress: '10.0.12.45', details: 'Enabled auto-block for critical risk level detections.', metadata: { setting: 'autoBlockCritical', value: 'true' } },
  { id: 'aud-005', timestamp: daysAgo(1, 5), actor: 'System', action: 'Policy Violation', resource: 'Source Code Guard', category: 'detection', severity: 'critical', ipAddress: '10.0.22.33', details: 'Proprietary source code detected in ChatGPT prompt. Request blocked and user notified.', metadata: { interactionId: 'int-0012', policyId: 'pol-003' } },
  { id: 'aud-006', timestamp: daysAgo(2, 1), actor: 'Elena Rodriguez', action: 'User Role Modified', resource: 'Amanda Foster', category: 'user', severity: 'warning', ipAddress: '10.0.18.90', details: 'Updated user permissions to include AI governance reviewer role.', metadata: { targetUser: 'amanda.foster', newRole: 'governance_reviewer' } },
  { id: 'aud-007', timestamp: daysAgo(2, 8), actor: 'System', action: 'Anomaly Detected', resource: 'AI Activity Monitor', category: 'detection', severity: 'warning', ipAddress: '10.0.31.55', details: 'Unusual spike in blocked requests from Engineering department (+340% vs baseline).', metadata: { department: 'Engineering', baseline: '12/day', current: '53/day' } },
  { id: 'aud-008', timestamp: daysAgo(3, 3), actor: "Michael O'Brien", action: 'Policy Created', resource: 'Third-Party AI Allowlist', category: 'policy', severity: 'info', ipAddress: '10.0.12.45', details: 'Added Perplexity to approved AI applications list with restricted data scope.', metadata: { policyId: 'pol-006', application: 'Perplexity' } },
  { id: 'aud-009', timestamp: daysAgo(4, 2), actor: 'System', action: 'Data Export', resource: 'Audit Logs', category: 'access', severity: 'info', ipAddress: '10.0.12.45', details: 'Compliance audit report exported for Q2 2026 regulatory review.', metadata: { exportFormat: 'CSV', recordCount: '1247' } },
  { id: 'aud-010', timestamp: daysAgo(5, 4), actor: 'David Kim', action: 'Login Failed', resource: 'SHADOWGUARD Admin', category: 'access', severity: 'warning', ipAddress: '203.45.67.89', details: 'Failed login attempt from unrecognized IP address. Account temporarily locked.', metadata: { attempts: '5', lockDuration: '30min' } },
  { id: 'aud-011', timestamp: daysAgo(6, 1), actor: 'System', action: 'Scheduled Scan', resource: 'Data Security Scanner', category: 'detection', severity: 'info', ipAddress: '10.0.1.1', details: 'Completed daily sensitive data pattern scan. 3 new detections flagged for review.', metadata: { scanDuration: '4m 32s', newDetections: '3' } },
  { id: 'aud-012', timestamp: daysAgo(7, 6), actor: "Michael O'Brien", action: 'Policy Disabled', resource: 'HR Data Processing', category: 'policy', severity: 'warning', ipAddress: '10.0.12.45', details: 'Temporarily disabled HR data processing policy pending legal review.', metadata: { policyId: 'pol-008', reason: 'legal_review' } },
];

export function seed() {
  initSchema();

  // Wipe existing rows first so this script is safely re-runnable.
  db.exec(`
    DELETE FROM ai_interactions;
    DELETE FROM risk_assessments;
    DELETE FROM sensitive_data_detections;
    DELETE FROM policies;
    DELETE FROM audit_logs;
    DELETE FROM organization_settings;
    DELETE FROM governance_preferences;
    DELETE FROM notification_preferences;
    DELETE FROM user_profile;
  `);

  const interactions = generateInteractions(87);

  const insertInteraction = db.prepare(`
    INSERT INTO ai_interactions
      (id, timestamp, user, department, aiApplication, requestType, riskLevel, dataDetected, policy, status, promptSummary)
    VALUES (@id, @timestamp, @user, @department, @aiApplication, @requestType, @riskLevel, @dataDetected, @policy, @status, @promptSummary)
  `);

  const insertRisk = db.prepare(`
    INSERT INTO risk_assessments
      (id, interactionId, timestamp, user, aiApplication, requestType, riskLevel, riskScore, factors, dataDetected, status)
    VALUES (@id, @interactionId, @timestamp, @user, @aiApplication, @requestType, @riskLevel, @riskScore, @factors, @dataDetected, @status)
  `);

  // node:sqlite doesn't have better-sqlite3's `.transaction()` convenience
  // wrapper, so we wrap the batch insert in an explicit transaction
  // ourselves. This keeps all 87 inserts as one atomic unit and is much
  // faster than committing after every single row.
  db.exec('BEGIN');
  try {
    for (const i of interactions) {
      insertInteraction.run({ ...i, dataDetected: JSON.stringify(i.dataDetected) });

      if (i.riskLevel !== 'low') {
        insertRisk.run({
          id: `risk-${i.id}`,
          interactionId: i.id,
          timestamp: i.timestamp,
          user: i.user,
          aiApplication: i.aiApplication,
          requestType: i.requestType,
          riskLevel: i.riskLevel,
          riskScore: riskScoreFor(i.riskLevel),
          factors: JSON.stringify(factorsFor(i)),
          dataDetected: JSON.stringify(i.dataDetected),
          status: i.status,
        });
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const insertDetection = db.prepare(`
    INSERT INTO sensitive_data_detections
      (id, timestamp, dataType, severity, aiApplication, user, actionTaken, description, pattern)
    VALUES (@id, @timestamp, @dataType, @severity, @aiApplication, @user, @actionTaken, @description, @pattern)
  `);
  for (const d of sensitiveDetections) insertDetection.run(d);

  const insertPolicy = db.prepare(`
    INSERT INTO policies (id, name, description, scope, status, lastUpdated, rules, violations)
    VALUES (@id, @name, @description, @scope, @status, @lastUpdated, @rules, @violations)
  `);
  for (const p of policies) insertPolicy.run(p);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, timestamp, actor, action, resource, category, severity, ipAddress, details, metadata)
    VALUES (@id, @timestamp, @actor, @action, @resource, @category, @severity, @ipAddress, @details, @metadata)
  `);
  for (const a of auditLogs) insertAudit.run({ ...a, metadata: JSON.stringify(a.metadata) });

  db.prepare(`INSERT INTO organization_settings (id, data) VALUES (1, ?)`).run(
    JSON.stringify({
      name: 'Acme Corporation',
      domain: 'acme-corp.com',
      industry: 'Financial Services',
      employeeCount: 12500,
      plan: 'Enterprise',
    }),
  );

  db.prepare(`INSERT INTO governance_preferences (id, data) VALUES (1, ?)`).run(
    JSON.stringify({
      defaultPolicyAction: 'restricted',
      autoBlockCritical: true,
      requireApprovalForRestricted: true,
      dataRetentionDays: 365,
      scanAttachments: true,
      monitorClipboard: false,
    }),
  );

  db.prepare(`INSERT INTO notification_preferences (id, data) VALUES (1, ?)`).run(
    JSON.stringify({
      emailAlerts: true,
      slackIntegration: true,
      criticalOnly: false,
      dailyDigest: true,
      alertRecipients: ['security@acme-corp.com', 'compliance@acme-corp.com'],
    }),
  );

  db.prepare(`INSERT INTO user_profile (id, data) VALUES (1, ?)`).run(
    JSON.stringify({
      name: "Michael O'Brien",
      email: 'michael.obrien@acme-corp.com',
      role: 'Security Administrator',
      department: 'Information Security',
      lastLogin: daysAgo(0, 2),
    }),
  );

  console.log(`Seeded database: ${interactions.length} AI interactions, ${policies.length} policies, ${auditLogs.length} audit logs.`);
}

// Allow running this file directly: `npm run seed`
const isMain = process.argv[1] && process.argv[1].endsWith('seed.ts');
if (isMain) {
  seed();
}
