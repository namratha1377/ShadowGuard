export type GovernanceStatus = 'allowed' | 'restricted' | 'blocked';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RequestType =
  | 'Code Assistance'
  | 'Summarization'
  | 'Document Analysis'
  | 'Data Analysis'
  | 'Content Generation';

export type SensitiveDataType = 'PII' | 'Source Code' | 'Financial' | 'Confidential Documents';

export interface AIInteraction {
  id: string;
  timestamp: string;
  user: string;
  department: string;
  aiApplication: string;
  requestType: RequestType;
  riskLevel: RiskLevel;
  dataDetected: SensitiveDataType[];
  policy: string;
  status: GovernanceStatus;
  promptSummary: string;
}

export interface RiskAssessment {
  id: string;
  timestamp: string;
  user: string;
  aiApplication: string;
  requestType: RequestType;
  riskLevel: RiskLevel;
  riskScore: number;
  factors: string[];
  dataDetected: SensitiveDataType[];
  status: GovernanceStatus;
}

export interface SensitiveDataDetection {
  id: string;
  timestamp: string;
  dataType: SensitiveDataType;
  severity: RiskLevel;
  aiApplication: string;
  user: string;
  actionTaken: GovernanceStatus;
  description: string;
  pattern: string;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  scope: string;
  status: 'enabled' | 'disabled';
  lastUpdated: string;
  rules: number;
  violations: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  category: 'policy' | 'access' | 'detection' | 'configuration' | 'user';
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
  details: string;
  metadata: Record<string, string>;
}

export interface DashboardMetrics {
  kpis: {
    totalRequests: number;
    allowed: number;
    restricted: number;
    blocked: number;
    changePercent: number;
  };
  activityOverTime: { date: string; allowed: number; restricted: number; blocked: number }[];
  riskDistribution: { level: string; count: number; color: string }[];
  topApplications: { name: string; requests: number; riskScore: number }[];
  recentSecurityEvents: SecurityEvent[];
  recentInteractions: AIInteraction[];
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: RiskLevel;
  type: 'detection' | 'policy' | 'access' | 'anomaly';
}

export interface RiskSummary {
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
  trend: { date: string; low: number; medium: number; high: number; critical: number }[];
  topFactors: { factor: string; count: number; trend: 'up' | 'down' | 'stable' }[];
}

export interface DataSecuritySummary {
  detectionsByType: { type: SensitiveDataType; count: number; trend: number }[];
  recentDetections: SensitiveDataDetection[];
  trendOverTime: { date: string; PII: number; 'Source Code': number; Financial: number; 'Confidential Documents': number }[];
}

export interface OrganizationSettings {
  name: string;
  domain: string;
  industry: string;
  employeeCount: number;
  plan: string;
}

export interface GovernancePreferences {
  defaultPolicyAction: GovernanceStatus;
  autoBlockCritical: boolean;
  requireApprovalForRestricted: boolean;
  dataRetentionDays: number;
  scanAttachments: boolean;
  monitorClipboard: boolean;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  slackIntegration: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
  alertRecipients: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AIInteractionFilters {
  search?: string;
  status?: GovernanceStatus | 'all';
  riskLevel?: RiskLevel | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogFilters {
  search?: string;
  category?: AuditLog['category'] | 'all';
  severity?: AuditLog['severity'] | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
