import type {
  AIInteraction,
  AuditLog,
  DashboardMetrics,
  DataSecuritySummary,
  GovernancePolicy,
  OrganizationSettings,
  GovernancePreferences,
  NotificationPreferences,
  UserProfile,
  RiskAssessment,
  RiskSummary,
  SensitiveDataDetection,
} from '../types';

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
  { name: 'Michael O\'Brien', department: 'Security' },
];

const apps = ['ChatGPT', 'Microsoft Copilot', 'Gemini', 'Claude', 'Perplexity', 'GitHub Copilot'];
const requestTypes = ['Code Assistance', 'Summarization', 'Document Analysis', 'Data Analysis', 'Content Generation'] as const;
const dataTypes = ['PII', 'Source Code', 'Financial', 'Confidential Documents'] as const;
const policies = [
  'Enterprise AI Usage Policy',
  'PII Data Protection',
  'Source Code Guard',
  'Financial Data Restriction',
  'Confidential Document Block',
  'Third-Party AI Allowlist',
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

function generateInteractions(count: number): AIInteraction[] {
  const interactions: AIInteraction[] = [];
  const statuses: ('allowed' | 'restricted' | 'blocked')[] = ['allowed', 'allowed', 'allowed', 'restricted', 'blocked'];
  const risks: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'low', 'medium', 'high', 'critical'];

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
      policy: randomFrom(policies),
      status,
      promptSummary: [
        'Analyze quarterly revenue projections for Q3',
        'Summarize vendor contract terms and liability clauses',
        'Generate Python script for data pipeline automation',
        'Review employee performance evaluation template',
        'Extract key metrics from financial spreadsheet',
        'Draft marketing copy for product launch campaign',
        'Debug authentication middleware implementation',
        'Compare competitor pricing strategies in SaaS market',
      ][i % 8],
    });
  }

  return interactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockAIInteractions = generateInteractions(87);

export const mockRiskAssessments: RiskAssessment[] = mockAIInteractions
  .filter((i) => i.riskLevel !== 'low')
  .map((i) => ({
    id: `risk-${i.id}`,
    timestamp: i.timestamp,
    user: i.user,
    aiApplication: i.aiApplication,
    requestType: i.requestType,
    riskLevel: i.riskLevel,
    riskScore: i.riskLevel === 'critical' ? 92 + Math.floor(Math.random() * 8)
      : i.riskLevel === 'high' ? 75 + Math.floor(Math.random() * 15)
      : i.riskLevel === 'medium' ? 45 + Math.floor(Math.random() * 25)
      : 10 + Math.floor(Math.random() * 20),
    factors: [
      ...(i.dataDetected.length > 0 ? [`Sensitive data detected: ${i.dataDetected.join(', ')}`] : []),
      ...(i.requestType === 'Code Assistance' ? ['Source code context identified'] : []),
      ...(i.aiApplication === 'ChatGPT' ? ['Non-enterprise AI endpoint'] : []),
      'User not in approved AI group',
    ].slice(0, 3),
    dataDetected: i.dataDetected,
    status: i.status,
  }));

export const mockSensitiveDataDetections: SensitiveDataDetection[] = [
  {
    id: 'det-001',
    timestamp: daysAgo(0, 2),
    dataType: 'PII',
    severity: 'high',
    aiApplication: 'ChatGPT',
    user: 'Marcus Johnson',
    actionTaken: 'blocked',
    description: 'Social Security Number pattern detected in prompt text',
    pattern: 'SSN: XXX-XX-XXXX',
  },
  {
    id: 'det-002',
    timestamp: daysAgo(0, 5),
    dataType: 'Source Code',
    severity: 'critical',
    aiApplication: 'GitHub Copilot',
    user: 'Sarah Chen',
    actionTaken: 'restricted',
    description: 'Proprietary authentication module source code pasted into prompt',
    pattern: 'Internal repo: auth-service/v2',
  },
  {
    id: 'det-003',
    timestamp: daysAgo(1, 3),
    dataType: 'Financial',
    severity: 'high',
    aiApplication: 'Microsoft Copilot',
    user: 'Marcus Johnson',
    actionTaken: 'blocked',
    description: 'Unredacted revenue figures and EBITDA data in document upload',
    pattern: 'Financial statement Q2 2026',
  },
  {
    id: 'det-004',
    timestamp: daysAgo(1, 8),
    dataType: 'Confidential Documents',
    severity: 'critical',
    aiApplication: 'Claude',
    user: 'Elena Rodriguez',
    actionTaken: 'blocked',
    description: 'Attorney-client privileged communication submitted for summarization',
    pattern: 'Legal brief — Case #2026-L-4892',
  },
  {
    id: 'det-005',
    timestamp: daysAgo(2, 1),
    dataType: 'PII',
    severity: 'medium',
    aiApplication: 'Gemini',
    user: 'Amanda Foster',
    actionTaken: 'restricted',
    description: 'Employee records with names and email addresses detected',
    pattern: 'HR employee directory export',
  },
  {
    id: 'det-006',
    timestamp: daysAgo(2, 6),
    dataType: 'Source Code',
    severity: 'high',
    aiApplication: 'ChatGPT',
    user: 'Priya Patel',
    actionTaken: 'blocked',
    description: 'API keys and database connection strings in code snippet',
    pattern: 'AWS credentials in config file',
  },
  {
    id: 'det-007',
    timestamp: daysAgo(3, 2),
    dataType: 'Financial',
    severity: 'medium',
    aiApplication: 'Perplexity',
    user: 'James Wright',
    actionTaken: 'restricted',
    description: 'Customer pricing tiers and discount schedules referenced',
    pattern: 'Sales pricing matrix 2026',
  },
  {
    id: 'det-008',
    timestamp: daysAgo(3, 9),
    dataType: 'Confidential Documents',
    severity: 'high',
    aiApplication: 'Microsoft Copilot',
    user: 'David Kim',
    actionTaken: 'restricted',
    description: 'Unreleased product roadmap document shared for analysis',
    pattern: 'Product roadmap — Confidential',
  },
  {
    id: 'det-009',
    timestamp: daysAgo(4, 4),
    dataType: 'PII',
    severity: 'low',
    aiApplication: 'Claude',
    user: 'Lisa Thompson',
    actionTaken: 'allowed',
    description: 'Generic email format detected — no specific identifiers matched',
    pattern: 'Email address pattern',
  },
  {
    id: 'det-010',
    timestamp: daysAgo(5, 1),
    dataType: 'Financial',
    severity: 'critical',
    aiApplication: 'ChatGPT',
    user: 'Robert Hayes',
    actionTaken: 'blocked',
    description: 'M&A due diligence financials uploaded for analysis',
    pattern: 'Acquisition target financials',
  },
];

export const mockPolicies: GovernancePolicy[] = [
  {
    id: 'pol-001',
    name: 'Enterprise AI Usage Policy',
    description: 'Baseline policy governing all AI tool usage across the organization. Requires approved applications and audit logging.',
    scope: 'Organization-wide',
    status: 'enabled',
    lastUpdated: daysAgo(14),
    rules: 12,
    violations: 23,
  },
  {
    id: 'pol-002',
    name: 'PII Data Protection',
    description: 'Blocks transmission of personally identifiable information including SSN, passport numbers, and health records to external AI services.',
    scope: 'All departments',
    status: 'enabled',
    lastUpdated: daysAgo(7),
    rules: 8,
    violations: 15,
  },
  {
    id: 'pol-003',
    name: 'Source Code Guard',
    description: 'Prevents upload of proprietary source code, API keys, and credentials to non-approved AI coding assistants.',
    scope: 'Engineering, Product',
    status: 'enabled',
    lastUpdated: daysAgo(3),
    rules: 6,
    violations: 8,
  },
  {
    id: 'pol-004',
    name: 'Financial Data Restriction',
    description: 'Restricts sharing of financial statements, revenue data, and pricing information with external AI platforms.',
    scope: 'Finance, Sales, Operations',
    status: 'enabled',
    lastUpdated: daysAgo(21),
    rules: 5,
    violations: 11,
  },
  {
    id: 'pol-005',
    name: 'Confidential Document Block',
    description: 'Blocks attorney-client privileged documents, board materials, and classified internal communications.',
    scope: 'Legal, Executive',
    status: 'enabled',
    lastUpdated: daysAgo(5),
    rules: 4,
    violations: 6,
  },
  {
    id: 'pol-006',
    name: 'Third-Party AI Allowlist',
    description: 'Maintains approved list of AI applications permitted for enterprise use. All others are blocked by default.',
    scope: 'Organization-wide',
    status: 'enabled',
    lastUpdated: daysAgo(1),
    rules: 3,
    violations: 42,
  },
  {
    id: 'pol-007',
    name: 'Marketing Content Generation',
    description: 'Allows content generation for marketing materials with brand compliance checks. Restricts competitor analysis data.',
    scope: 'Marketing',
    status: 'enabled',
    lastUpdated: daysAgo(30),
    rules: 4,
    violations: 2,
  },
  {
    id: 'pol-008',
    name: 'HR Data Processing',
    description: 'Governs use of AI for HR workflows including resume screening and employee communications.',
    scope: 'HR',
    status: 'disabled',
    lastUpdated: daysAgo(45),
    rules: 5,
    violations: 0,
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: daysAgo(0, 1),
    actor: 'Michael O\'Brien',
    action: 'Policy Updated',
    resource: 'PII Data Protection',
    category: 'policy',
    severity: 'info',
    ipAddress: '10.0.12.45',
    details: 'Updated detection rules to include passport number patterns for EU compliance.',
    metadata: { policyId: 'pol-002', changeType: 'rule_addition' },
  },
  {
    id: 'aud-002',
    timestamp: daysAgo(0, 3),
    actor: 'System',
    action: 'Critical Detection',
    resource: 'ChatGPT Interaction',
    category: 'detection',
    severity: 'critical',
    ipAddress: '10.0.8.112',
    details: 'Blocked request containing SSN data from Finance department user.',
    metadata: { interactionId: 'int-0003', userId: 'marcus.johnson' },
  },
  {
    id: 'aud-003',
    timestamp: daysAgo(0, 6),
    actor: 'Sarah Chen',
    action: 'Access Denied',
    resource: 'GitHub Copilot',
    category: 'access',
    severity: 'warning',
    ipAddress: '10.0.15.78',
    details: 'Attempted to use non-approved AI application. Request redirected to approved alternative.',
    metadata: { application: 'GitHub Copilot', approvedAlternative: 'Microsoft Copilot' },
  },
  {
    id: 'aud-004',
    timestamp: daysAgo(1, 2),
    actor: 'Michael O\'Brien',
    action: 'Configuration Changed',
    resource: 'Governance Settings',
    category: 'configuration',
    severity: 'info',
    ipAddress: '10.0.12.45',
    details: 'Enabled auto-block for critical risk level detections.',
    metadata: { setting: 'autoBlockCritical', value: 'true' },
  },
  {
    id: 'aud-005',
    timestamp: daysAgo(1, 5),
    actor: 'System',
    action: 'Policy Violation',
    resource: 'Source Code Guard',
    category: 'detection',
    severity: 'critical',
    ipAddress: '10.0.22.33',
    details: 'Proprietary source code detected in ChatGPT prompt. Request blocked and user notified.',
    metadata: { interactionId: 'int-0012', policyId: 'pol-003' },
  },
  {
    id: 'aud-006',
    timestamp: daysAgo(2, 1),
    actor: 'Elena Rodriguez',
    action: 'User Role Modified',
    resource: 'Amanda Foster',
    category: 'user',
    severity: 'warning',
    ipAddress: '10.0.18.90',
    details: 'Updated user permissions to include AI governance reviewer role.',
    metadata: { targetUser: 'amanda.foster', newRole: 'governance_reviewer' },
  },
  {
    id: 'aud-007',
    timestamp: daysAgo(2, 8),
    actor: 'System',
    action: 'Anomaly Detected',
    resource: 'AI Activity Monitor',
    category: 'detection',
    severity: 'warning',
    ipAddress: '10.0.31.55',
    details: 'Unusual spike in blocked requests from Engineering department (+340% vs baseline).',
    metadata: { department: 'Engineering', baseline: '12/day', current: '53/day' },
  },
  {
    id: 'aud-008',
    timestamp: daysAgo(3, 3),
    actor: 'Michael O\'Brien',
    action: 'Policy Created',
    resource: 'Third-Party AI Allowlist',
    category: 'policy',
    severity: 'info',
    ipAddress: '10.0.12.45',
    details: 'Added Perplexity to approved AI applications list with restricted data scope.',
    metadata: { policyId: 'pol-006', application: 'Perplexity' },
  },
  {
    id: 'aud-009',
    timestamp: daysAgo(4, 2),
    actor: 'System',
    action: 'Data Export',
    resource: 'Audit Logs',
    category: 'access',
    severity: 'info',
    ipAddress: '10.0.12.45',
    details: 'Compliance audit report exported for Q2 2026 regulatory review.',
    metadata: { exportFormat: 'CSV', recordCount: '1247' },
  },
  {
    id: 'aud-010',
    timestamp: daysAgo(5, 4),
    actor: 'David Kim',
    action: 'Login Failed',
    resource: 'SHADOWGUARD Admin',
    category: 'access',
    severity: 'warning',
    ipAddress: '203.45.67.89',
    details: 'Failed login attempt from unrecognized IP address. Account temporarily locked.',
    metadata: { attempts: '5', lockDuration: '30min' },
  },
  {
    id: 'aud-011',
    timestamp: daysAgo(6, 1),
    actor: 'System',
    action: 'Scheduled Scan',
    resource: 'Data Security Scanner',
    category: 'detection',
    severity: 'info',
    ipAddress: '10.0.1.1',
    details: 'Completed daily sensitive data pattern scan. 3 new detections flagged for review.',
    metadata: { scanDuration: '4m 32s', newDetections: '3' },
  },
  {
    id: 'aud-012',
    timestamp: daysAgo(7, 6),
    actor: 'Michael O\'Brien',
    action: 'Policy Disabled',
    resource: 'HR Data Processing',
    category: 'policy',
    severity: 'warning',
    ipAddress: '10.0.12.45',
    details: 'Temporarily disabled HR data processing policy pending legal review.',
    metadata: { policyId: 'pol-008', reason: 'legal_review' },
  },
];

const activityDates = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return d.toISOString().split('T')[0];
});

export const mockDashboardMetrics: DashboardMetrics = {
  kpis: {
    totalRequests: 2847,
    allowed: 2156,
    restricted: 412,
    blocked: 279,
    changePercent: 12.4,
  },
  activityOverTime: activityDates.map((date, i) => ({
    date,
    allowed: 140 + Math.floor(Math.random() * 60) + i * 3,
    restricted: 20 + Math.floor(Math.random() * 25),
    blocked: 10 + Math.floor(Math.random() * 20),
  })),
  riskDistribution: [
    { level: 'Low', count: 1823, color: '#737373' },
    { level: 'Medium', count: 612, color: '#F59E0B' },
    { level: 'High', count: 312, color: '#EF4444' },
    { level: 'Critical', count: 100, color: '#DC2626' },
  ],
  topApplications: [
    { name: 'ChatGPT', requests: 892, riskScore: 68 },
    { name: 'Microsoft Copilot', requests: 756, riskScore: 42 },
    { name: 'Claude', requests: 534, riskScore: 55 },
    { name: 'Gemini', requests: 412, riskScore: 38 },
    { name: 'GitHub Copilot', requests: 253, riskScore: 72 },
  ],
  recentSecurityEvents: [
    {
      id: 'evt-001',
      timestamp: daysAgo(0, 1),
      title: 'Critical PII Detection Blocked',
      description: 'SSN pattern detected in ChatGPT prompt from Finance user',
      severity: 'critical',
      type: 'detection',
    },
    {
      id: 'evt-002',
      timestamp: daysAgo(0, 4),
      title: 'Unauthorized AI Application Access',
      description: 'Engineering user attempted access to non-approved AI tool',
      severity: 'high',
      type: 'access',
    },
    {
      id: 'evt-003',
      timestamp: daysAgo(1, 2),
      title: 'Policy Violation — Source Code',
      description: 'Proprietary authentication module code submitted to external AI',
      severity: 'critical',
      type: 'policy',
    },
    {
      id: 'evt-004',
      timestamp: daysAgo(1, 8),
      title: 'Anomaly: Blocked Request Spike',
      description: '340% increase in blocked requests from Engineering department',
      severity: 'high',
      type: 'anomaly',
    },
    {
      id: 'evt-005',
      timestamp: daysAgo(2, 3),
      title: 'Financial Data Restriction Triggered',
      description: 'Unredacted Q2 revenue data blocked in Microsoft Copilot session',
      severity: 'high',
      type: 'detection',
    },
  ],
  recentInteractions: mockAIInteractions.slice(0, 8),
};

export const mockRiskSummary: RiskSummary = {
  low: 1823,
  medium: 612,
  high: 312,
  critical: 100,
  total: 2847,
  trend: activityDates.map((date) => ({
    date,
    low: 120 + Math.floor(Math.random() * 30),
    medium: 35 + Math.floor(Math.random() * 15),
    high: 15 + Math.floor(Math.random() * 10),
    critical: 3 + Math.floor(Math.random() * 5),
  })),
  topFactors: [
    { factor: 'Sensitive data in prompt', count: 187, trend: 'up' },
    { factor: 'Non-approved AI application', count: 142, trend: 'up' },
    { factor: 'Source code context detected', count: 98, trend: 'stable' },
    { factor: 'Financial data patterns', count: 76, trend: 'down' },
    { factor: 'Confidential document upload', count: 54, trend: 'up' },
    { factor: 'Excessive prompt length', count: 41, trend: 'stable' },
  ],
};

export const mockDataSecuritySummary: DataSecuritySummary = {
  detectionsByType: [
    { type: 'PII', count: 156, trend: 8.2 },
    { type: 'Source Code', count: 89, trend: -3.1 },
    { type: 'Financial', count: 67, trend: 12.5 },
    { type: 'Confidential Documents', count: 43, trend: 5.7 },
  ],
  recentDetections: mockSensitiveDataDetections,
  trendOverTime: activityDates.map((date) => ({
    date,
    PII: 8 + Math.floor(Math.random() * 6),
    'Source Code': 4 + Math.floor(Math.random() * 5),
    Financial: 3 + Math.floor(Math.random() * 4),
    'Confidential Documents': 2 + Math.floor(Math.random() * 3),
  })),
};

export const mockOrganizationSettings: OrganizationSettings = {
  name: 'Acme Corporation',
  domain: 'acme-corp.com',
  industry: 'Financial Services',
  employeeCount: 12500,
  plan: 'Enterprise',
};

export const mockGovernancePreferences: GovernancePreferences = {
  defaultPolicyAction: 'restricted',
  autoBlockCritical: true,
  requireApprovalForRestricted: true,
  dataRetentionDays: 365,
  scanAttachments: true,
  monitorClipboard: false,
};

export const mockNotificationPreferences: NotificationPreferences = {
  emailAlerts: true,
  slackIntegration: true,
  criticalOnly: false,
  dailyDigest: true,
  alertRecipients: ['security@acme-corp.com', 'compliance@acme-corp.com'],
};

export const mockUserProfile: UserProfile = {
  name: 'Michael O\'Brien',
  email: 'michael.obrien@acme-corp.com',
  role: 'Security Administrator',
  department: 'Information Security',
  lastLogin: daysAgo(0, 2),
};
