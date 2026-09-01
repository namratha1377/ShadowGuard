import { useEffect, useState } from 'react';
import { Code, DollarSign, FileText, User } from 'lucide-react';
import { RiskBadge, StatusBadge } from '../components/badges/StatusBadge';
import { Card } from '../components/cards/Card';
import { KPICard } from '../components/cards/KPICard';
import { LoadingState } from '../components/common/EmptyState';
import { DataTypeTrendChart } from '../components/charts/Charts';
import { Header, Layout } from '../components/layout/Layout';
import { getSensitiveDataDetections } from '../services/api';
import type { DataSecuritySummary, SensitiveDataType } from '../types';
import { formatTimestamp } from '../utils/format';

const typeIcons: Record<SensitiveDataType, React.ReactNode> = {
  PII: <User className="w-4 h-4" />,
  'Source Code': <Code className="w-4 h-4" />,
  Financial: <DollarSign className="w-4 h-4" />,
  'Confidential Documents': <FileText className="w-4 h-4" />,
};

export function DataSecurityPage() {
  const [data, setData] = useState<DataSecuritySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSensitiveDataDetections().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <Layout>
        <Header title="Data Security" subtitle="Monitor sensitive data exposure in AI interactions" />
        <LoadingState message="Loading data security metrics..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Data Security" subtitle="Monitor sensitive data exposure in AI interactions" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.detectionsByType.map((item) => (
            <KPICard
              key={item.type}
              title={item.type}
              value={item.count}
              subtitle="detections this period"
              icon={typeIcons[item.type]}
              change={item.trend}
            />
          ))}
        </div>

        <Card title="Detection Trends" subtitle="By data type — last 14 days">
          <DataTypeTrendChart data={data.trendOverTime} />
        </Card>

        <Card title="Recent Detections" subtitle="Sensitive data identified in AI interactions">
          <div className="overflow-x-auto -mx-4 -mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Timestamp', 'Data Type', 'Severity', 'Application', 'User', 'Pattern', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentDetections.map((d) => (
                  <tr key={d.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-2.5 text-xs text-text-muted whitespace-nowrap">{formatTimestamp(d.timestamp)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">{typeIcons[d.dataType]}</span>
                        <span className="text-sm">{d.dataType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><RiskBadge level={d.severity} /></td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{d.aiApplication}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{d.user}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted max-w-[180px] truncate">{d.pattern}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={d.actionTaken} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.recentDetections.slice(0, 4).map((d) => (
            <div key={d.id} className="p-4 bg-bg-secondary border border-border rounded">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">{typeIcons[d.dataType]}</span>
                  <span className="text-sm font-medium">{d.dataType}</span>
                </div>
                <RiskBadge level={d.severity} />
              </div>
              <p className="text-xs text-text-secondary mb-2">{d.description}</p>
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>{d.aiApplication} · {d.user}</span>
                <div className="flex items-center gap-1">
                  <StatusBadge status={d.actionTaken} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
