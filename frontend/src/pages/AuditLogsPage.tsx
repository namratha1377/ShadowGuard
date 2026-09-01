import { useCallback, useEffect, useState } from 'react';
import { InfoBadge } from '../components/badges/StatusBadge';
import { Card } from '../components/cards/Card';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { FilterBar, SearchInput, SelectFilter } from '../components/filters/Filters';
import { Header, Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/tables/DataTable';
import { Pagination } from '../components/tables/Pagination';
import { getAuditLogs } from '../services/api';
import type { AuditLog, PaginatedResponse } from '../types';
import { formatTimestamp } from '../utils/format';

const severityStyles: Record<AuditLog['severity'], string> = {
  info: 'text-status-info',
  warning: 'text-status-restricted',
  critical: 'text-status-blocked',
};

export function AuditLogsPage() {
  const [result, setResult] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getAuditLogs({
      search: search || undefined,
      category: category as AuditLog['category'] | 'all',
      severity: severity as AuditLog['severity'] | 'all',
      page,
      pageSize: 10,
    });
    setResult(data);
    setLoading(false);
  }, [search, category, severity, page]);

  useEffect(() => {
    const timer = setTimeout(fetchData, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchData, search]);

  useEffect(() => {
    setPage(1);
  }, [search, category, severity]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (l) => <span className="text-xs whitespace-nowrap">{formatTimestamp(l.timestamp)}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (l) => <span className="text-sm">{l.actor}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => <span className="text-sm font-medium text-text-primary">{l.action}</span>,
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (l) => <span className="text-xs text-text-muted">{l.resource}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (l) => <InfoBadge label={l.category} />,
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (l) => (
        <span className={`text-xs font-medium capitalize ${severityStyles[l.severity]}`}>
          {l.severity}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (l) => <span className="text-xs font-mono text-text-muted">{l.ipAddress}</span>,
    },
  ];

  return (
    <Layout>
      <Header title="Audit Logs" subtitle="Compliance audit trail for all governance activities" />

      <div className="p-6 space-y-4">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search actor, action, resource..."
            className="w-full sm:w-64"
          />
          <SelectFilter
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'policy', label: 'Policy' },
              { value: 'access', label: 'Access' },
              { value: 'detection', label: 'Detection' },
              { value: 'configuration', label: 'Configuration' },
              { value: 'user', label: 'User' },
            ]}
            className="w-40"
          />
          <SelectFilter
            label="Severity"
            value={severity}
            onChange={setSeverity}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'critical', label: 'Critical' },
            ]}
            className="w-36"
          />
        </FilterBar>

        <Card noPadding>
          {loading ? (
            <LoadingState message="Loading audit logs..." />
          ) : result && result.data.length > 0 ? (
            <>
              <DataTable
                columns={columns}
                data={result.data}
                keyExtractor={(l) => l.id}
                onRowClick={setSelectedLog}
              />
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={result.pageSize}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState title="No audit logs found" description="Try adjusting your search or filter criteria." />
          )}
        </Card>
      </div>

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Details"
        width="md"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Timestamp" value={formatTimestamp(selectedLog.timestamp)} />
              <DetailField label="Actor" value={selectedLog.actor} />
              <DetailField label="Action" value={selectedLog.action} />
              <DetailField label="Resource" value={selectedLog.resource} />
              <DetailField label="Category" value={selectedLog.category} />
              <DetailField label="Severity" value={selectedLog.severity} />
              <DetailField label="IP Address" value={selectedLog.ipAddress} className="col-span-2" />
            </div>

            <div>
              <p className="text-xs text-text-muted mb-1">Details</p>
              <p className="text-sm text-text-secondary bg-bg-primary border border-border rounded p-3">
                {selectedLog.details}
              </p>
            </div>

            {Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2">Metadata</p>
                <div className="bg-bg-primary border border-border rounded divide-y divide-border">
                  {Object.entries(selectedLog.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between px-3 py-2 text-xs">
                      <span className="text-text-muted">{key}</span>
                      <span className="text-text-secondary font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

function DetailField({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm text-text-primary capitalize">{value}</p>
    </div>
  );
}
