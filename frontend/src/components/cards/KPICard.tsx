import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: ReactNode;
  accent?: 'default' | 'allowed' | 'restricted' | 'blocked';
}

const accentStyles = {
  default: 'text-text-primary',
  allowed: 'text-status-allowed',
  restricted: 'text-status-restricted',
  blocked: 'text-status-blocked',
};

export function KPICard({ title, value, subtitle, change, icon, accent = 'default' }: KPICardProps) {
  return (
    <div className="bg-bg-secondary border border-border rounded p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{title}</p>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
      <p className={`text-2xl font-semibold tabular-nums ${accentStyles[accent]}`}>{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs ${change >= 0 ? 'text-status-blocked' : 'text-status-allowed'}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-text-muted">{subtitle}</span>}
      </div>
    </div>
  );
}
