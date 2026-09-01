import { useEffect, useState } from 'react';
import { Card } from '../components/cards/Card';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { Toggle } from '../components/common/Toggle';
import { Header, Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/tables/DataTable';
import { getPolicies, updatePolicyStatus } from '../services/api';
import type { GovernancePolicy } from '../types';
import { formatDate } from '../utils/format';

export function PoliciesPage() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolicies().then((data) => {
      setPolicies(data);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    const status = enabled ? 'enabled' : 'disabled';
    await updatePolicyStatus(id, status);
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
  };

  const columns: Column<GovernancePolicy>[] = [
    {
      key: 'name',
      header: 'Policy Name',
      render: (p) => (
        <div>
          <p className="text-sm font-medium text-text-primary">{p.name}</p>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1 max-w-xs">{p.description}</p>
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      render: (p) => <span className="text-xs">{p.scope}</span>,
    },
    {
      key: 'rules',
      header: 'Rules',
      render: (p) => <span className="text-sm tabular-nums">{p.rules}</span>,
    },
    {
      key: 'violations',
      header: 'Violations',
      render: (p) => (
        <span className={`text-sm tabular-nums ${p.violations > 0 ? 'text-status-restricted' : 'text-text-muted'}`}>
          {p.violations}
        </span>
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      render: (p) => <span className="text-xs text-text-muted whitespace-nowrap">{formatDate(p.lastUpdated)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Toggle
            enabled={p.status === 'enabled'}
            onChange={(enabled) => handleToggle(p.id, enabled)}
          />
          <span className={`text-xs ${p.status === 'enabled' ? 'text-status-allowed' : 'text-text-muted'}`}>
            {p.status === 'enabled' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Header title="Policies" subtitle="Manage AI governance policies and enforcement rules" />

      <div className="p-6">
        <Card noPadding>
          {loading ? (
            <LoadingState message="Loading policies..." />
          ) : policies.length > 0 ? (
            <DataTable columns={columns} data={policies} keyExtractor={(p) => p.id} />
          ) : (
            <EmptyState title="No policies configured" description="Create governance policies to control AI usage." />
          )}
        </Card>
      </div>
    </Layout>
  );
}
