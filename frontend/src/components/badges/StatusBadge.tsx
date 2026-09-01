import type { GovernanceStatus, RiskLevel } from '../../types';

const statusConfig: Record<GovernanceStatus, { label: string; className: string }> = {
  allowed: {
    label: 'Allowed',
    className: 'bg-status-allowed/10 text-status-allowed border-status-allowed/20',
  },
  restricted: {
    label: 'Restricted',
    className: 'bg-status-restricted/10 text-status-restricted border-status-restricted/20',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-status-blocked/10 text-status-blocked border-status-blocked/20',
  },
};

interface StatusBadgeProps {
  status: GovernanceStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center font-medium border rounded ${config.className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {config.label}
    </span>
  );
}

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-neutral-800 text-text-secondary border-neutral-700' },
  medium: { label: 'Medium', className: 'bg-status-restricted/10 text-status-restricted border-status-restricted/20' },
  high: { label: 'High', className: 'bg-status-blocked/10 text-status-blocked border-status-blocked/20' },
  critical: { label: 'Critical', className: 'bg-status-blocked/20 text-red-400 border-status-blocked/30' },
};

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const config = riskConfig[level];
  return (
    <span
      className={`inline-flex items-center font-medium border rounded ${config.className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {config.label}
    </span>
  );
}

interface InfoBadgeProps {
  label: string;
}

export function InfoBadge({ label }: InfoBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded bg-status-info/10 text-status-info border-status-info/20">
      {label}
    </span>
  );
}
