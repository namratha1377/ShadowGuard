// These types intentionally mirror `frontend/src/types/index.ts`.
// Keeping both sides in sync means the JSON the backend sends is always
// exactly what the frontend's TypeScript types expect - no surprises.

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
