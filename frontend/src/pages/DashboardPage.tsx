import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { ActivityChart, RiskDistributionChart, TopAppsChart } from '../components/charts/Charts';
import { RiskBadge, StatusBadge } from '../components/badges/StatusBadge';
import { Card } from '../components/cards/Card';
import { KPICard } from '../components/cards/KPICard';
import { LoadingState } from '../components/common/EmptyState';
import { Header, Layout } from '../components/layout/Layout';
import { getDashboardMetrics } from '../services/api';
import type { DashboardMetrics } from '../types';
import { formatTimestamp } from '../utils/format';

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <Layout>
        <Header title="Dashboard" subtitle="Enterprise AI governance overview" />
        <LoadingState message="Loading dashboard metrics..." />
      </Layout>
    );
  }

  const { kpis } = metrics;

  return (
    <Layout>
      <Header title="Dashboard" subtitle="Enterprise AI governance overview" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total AI Requests"
            value={kpis.totalRequests.toLocaleString()}
            change={kpis.changePercent}
            subtitle="vs last period"
            icon={<Activity className="w-4 h-4" />}
          />
          <KPICard
            title="Allowed"
            value={kpis.allowed.toLocaleString()}
            subtitle={`${((kpis.allowed / kpis.totalRequests) * 100).toFixed(1)}% of total`}
            icon={<CheckCircle className="w-4 h-4" />}
            accent="allowed"
          />
          <KPICard
            title="Restricted"
            value={kpis.restricted.toLocaleString()}
            subtitle={`${((kpis.restricted / kpis.totalRequests) * 100).toFixed(1)}% of total`}
            icon={<AlertTriangle className="w-4 h-4" />}
            accent="restricted"
          />
          <KPICard
            title="Blocked"
            value={kpis.blocked.toLocaleString()}
            subtitle={`${((kpis.blocked / kpis.totalRequests) * 100).toFixed(1)}% of total`}
            icon={<Ban className="w-4 h-4" />}
            accent="blocked"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="AI Activity Over Time" subtitle="Last 14 days" className="lg:col-span-2">
            <ActivityChart data={metrics.activityOverTime} />
          </Card>
          <Card title="Risk Distribution" subtitle="By severity level">
            <RiskDistributionChart data={metrics.riskDistribution} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Most Used AI Applications" subtitle="Request volume">
            <TopAppsChart data={metrics.topApplications} />
          </Card>

          <Card title="Recent Security Events" subtitle="Latest alerts">
            <div className="space-y-3">
              {metrics.recentSecurityEvents.map((event) => (
                <div key={event.id} className="flex gap-3 p-3 bg-bg-primary border border-border rounded">
                  <ShieldAlert className={`w-4 h-4 mt-0.5 shrink-0 ${
                    event.severity === 'critical' ? 'text-status-blocked' :
                    event.severity === 'high' ? 'text-status-restricted' : 'text-text-muted'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{event.title}</p>
                      <RiskBadge level={event.severity} />
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{event.description}</p>
                    <p className="text-[10px] text-text-muted mt-1">{formatTimestamp(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Recent AI Interactions" subtitle="Latest governed requests">
          <div className="overflow-x-auto -mx-4 -mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Timestamp', 'User', 'Application', 'Type', 'Risk', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.recentInteractions.map((i) => (
                  <tr key={i.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-2.5 text-xs text-text-muted whitespace-nowrap">{formatTimestamp(i.timestamp)}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{i.user}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{i.aiApplication}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{i.requestType}</td>
                    <td className="px-4 py-2.5"><RiskBadge level={i.riskLevel} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
