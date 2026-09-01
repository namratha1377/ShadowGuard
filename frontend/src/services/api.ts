// ---------------------------------------------------------------------------
// This file is the ONLY place in the frontend that knows the backend exists.
// Every page (Dashboard, AI Activity, Risk Assessment, etc.) imports
// functions from here instead of calling `fetch` directly. That's a nice
// pattern to keep: if the API ever changes, you only update it in one file.
//
// Each function below matches one backend route (see `backend/src/routes/`).
// They all funnel through the small `http()` helper at the bottom, which
// does the actual fetch + error handling + JSON parsing.
// ---------------------------------------------------------------------------

import type {
  AIInteraction,
  AIInteractionFilters,
  AuditLog,
  AuditLogFilters,
  DashboardMetrics,
  DataSecuritySummary,
  GovernancePolicy,
  GovernancePreferences,
  NotificationPreferences,
  OrganizationSettings,
  PaginatedResponse,
  RiskAssessment,
  RiskSummary,
  UserProfile,
} from '../types';

// Vite reads this from `.env` (VITE_API_URL) at build/dev time. Falling back
// to localhost:4000 means the app still works if you forget to set it.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return http<DashboardMetrics>('/dashboard/metrics');
}

export async function getAIInteractions(
  filters: AIInteractionFilters = {},
): Promise<PaginatedResponse<AIInteraction>> {
  return http<PaginatedResponse<AIInteraction>>(`/ai-interactions${toQueryString(filters)}`);
}

export async function getRiskAssessments(): Promise<{
  summary: RiskSummary;
  assessments: RiskAssessment[];
}> {
  return http('/risk-assessments');
}

export async function getSensitiveDataDetections(): Promise<DataSecuritySummary> {
  return http<DataSecuritySummary>('/data-security');
}

export async function getPolicies(): Promise<GovernancePolicy[]> {
  return http<GovernancePolicy[]>('/policies');
}

export async function updatePolicyStatus(
  id: string,
  status: 'enabled' | 'disabled',
): Promise<GovernancePolicy> {
  return http<GovernancePolicy>(`/policies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function getAuditLogs(
  filters: AuditLogFilters = {},
): Promise<PaginatedResponse<AuditLog>> {
  return http<PaginatedResponse<AuditLog>>(`/audit-logs${toQueryString(filters)}`);
}

export async function getOrganizationSettings(): Promise<OrganizationSettings> {
  return http<OrganizationSettings>('/settings/organization');
}

export async function getGovernancePreferences(): Promise<GovernancePreferences> {
  return http<GovernancePreferences>('/settings/governance');
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return http<NotificationPreferences>('/settings/notifications');
}

export async function getUserProfile(): Promise<UserProfile> {
  return http<UserProfile>('/settings/user');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Turns a filters object like { status: 'blocked', page: 2 } into "?status=blocked&page=2". */
function toQueryString(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Thin wrapper around fetch: builds the full URL, checks response.ok, parses JSON. */
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API request failed (${res.status} ${res.statusText}): ${path} ${body}`);
  }

  return res.json() as Promise<T>;
}
