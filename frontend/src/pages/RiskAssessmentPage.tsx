import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Minus, ShieldAlert } from 'lucide-react';
import { RiskBadge, StatusBadge } from '../components/badges/StatusBadge';
import { Card } from '../components/cards/Card';
import { KPICard } from '../components/cards/KPICard';
import { LoadingState } from '../components/common/EmptyState';
import { RiskDistributionChart, RiskTrendChart } from '../components/charts/Charts';
import { Header, Layout } from '../components/layout/Layout';
import { getRiskAssessments } from '../services/api';
import type { RiskAssessment, RiskSummary } from '../types';
import { formatTimestamp } from '../utils/format';

const trendIcons = {
  up: <ArrowUp className="w-3 h-3 text-status-blocked" />,
  down: <ArrowDown className="w-3 h-3 text-status-allowed" />,
  stable: <Minus className="w-3 h-3 text-text-muted" />,
};

export function RiskAssessmentPage() {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiskAssessments().then(({ summary: s, assessments: a }) => {
      setSummary(s);
      setAssessments(a);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return (
      <Layout>
        <Header title="Risk Assessment" subtitle="Analyze AI interaction risk levels and factors" />
        <LoadingState message="Loading risk assessments..." />
      </Layout>
    );
  }

  const distributionData = [
    { level: 'Low', count: summary.low, color: '#737373' },
    { level: 'Medium', count: summary.medium, color: '#F59E0B' },
    { level: 'High', count: summary.high, color: '#EF4444' },
    { level: 'Critical', count: summary.critical, color: '#DC2626' },
  ];

  return (
    <Layout>
      <Header title="Risk Assessment" subtitle="Analyze AI interaction risk levels and factors" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Low Risk" value={summary.low.toLocaleString()} accent="default" icon={<ShieldAlert className="w-4 h-4" />} />
          <KPICard title="Medium Risk" value={summary.medium.toLocaleString()} accent="restricted" icon={<AlertTriangle className="w-4 h-4" />} />
          <KPICard title="High Risk" value={summary.high.toLocaleString()} accent="blocked" icon={<AlertTriangle className="w-4 h-4" />} />
          <KPICard title="Critical Risk" value={summary.critical.toLocaleString()} accent="blocked" icon={<AlertTriangle className="w-4 h-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Risk Distribution" subtitle="Current period">
            <RiskDistributionChart data={distributionData} />
          </Card>
          <Card title="Risk Trend" subtitle="Last 14 days">
            <RiskTrendChart data={summary.trend} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Recent High-Risk Requests" subtitle="Requires attention" className="lg:col-span-2">
            <div className="overflow-x-auto -mx-4 -mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Timestamp', 'User', 'Application', 'Score', 'Risk', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assessments
                    .filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical')
                    .slice(0, 8)
                    .map((a) => (
                      <tr key={a.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-2.5 text-xs text-text-muted whitespace-nowrap">{formatTimestamp(a.timestamp)}</td>
                        <td className="px-4 py-2.5 text-sm text-text-secondary">{a.user}</td>
                        <td className="px-4 py-2.5 text-sm text-text-secondary">{a.aiApplication}</td>
                        <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{a.riskScore}</td>
                        <td className="px-4 py-2.5"><RiskBadge level={a.riskLevel} /></td>
                        <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Top Risk Factors" subtitle="Most common triggers">
            <div className="space-y-3">
              {summary.topFactors.map((factor) => (
                <div key={factor.factor} className="flex items-center justify-between p-2.5 bg-bg-primary border border-border rounded">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-secondary truncate">{factor.factor}</p>
                    <p className="text-sm font-semibold tabular-nums mt-0.5">{factor.count}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {trendIcons[factor.trend]}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
