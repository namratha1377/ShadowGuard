import { useCallback, useEffect, useState } from 'react';
import { RiskBadge, StatusBadge } from '../components/badges/StatusBadge';
import { Card } from '../components/cards/Card';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { DateFilter, FilterBar, SearchInput, SelectFilter } from '../components/filters/Filters';
import { Header, Layout } from '../components/layout/Layout';
import { DataTable, type Column } from '../components/tables/DataTable';
import { Pagination } from '../components/tables/Pagination';
import { getAIInteractions } from '../services/api';
import type { AIInteraction, PaginatedResponse } from '../types';
import { formatTimestamp } from '../utils/format';

const columns: Column<AIInteraction>[] = [
  {
    key: 'timestamp',
    header: 'Timestamp',
    render: (i) => <span className="text-xs whitespace-nowrap">{formatTimestamp(i.timestamp)}</span>,
  },
  {
    key: 'user',
    header: 'User',
    render: (i) => (
      <div>
        <p className="text-sm text-text-primary">{i.user}</p>
        <p className="text-xs text-text-muted">{i.department}</p>
      </div>
    ),
  },
  {
    key: 'application',
    header: 'AI Application',
    render: (i) => <span className="text-sm">{i.aiApplication}</span>,
  },
  {
    key: 'requestType',
    header: 'Request Type',
    render: (i) => <span className="text-xs">{i.requestType}</span>,
  },
  {
    key: 'riskLevel',
    header: 'Risk Level',
    render: (i) => <RiskBadge level={i.riskLevel} />,
  },
  {
    key: 'dataDetected',
    header: 'Data Detected',
    render: (i) => (
      <span className="text-xs">
        {i.dataDetected.length > 0 ? i.dataDetected.join(', ') : '—'}
      </span>
    ),
  },
  {
    key: 'policy',
    header: 'Policy',
    render: (i) => <span className="text-xs text-text-muted">{i.policy}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (i) => <StatusBadge status={i.status} />,
  },
];

export function AIActivityPage() {
  const [result, setResult] = useState<PaginatedResponse<AIInteraction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getAIInteractions({
      search: search || undefined,
      status: status as 'all' | 'allowed' | 'restricted' | 'blocked',
      riskLevel: riskLevel as 'all' | 'low' | 'medium' | 'high' | 'critical',
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize: 10,
    });
    setResult(data);
    setLoading(false);
  }, [search, status, riskLevel, dateFrom, dateTo, page]);

  useEffect(() => {
    const timer = setTimeout(fetchData, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchData, search]);

  useEffect(() => {
    setPage(1);
  }, [search, status, riskLevel, dateFrom, dateTo]);

  return (
    <Layout>
      <Header title="AI Activity" subtitle="Monitor and analyze all AI interactions across the organization" />

      <div className="p-6 space-y-4">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search users, apps, policies..."
            className="w-full sm:w-64"
          />
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'allowed', label: 'Allowed' },
              { value: 'restricted', label: 'Restricted' },
              { value: 'blocked', label: 'Blocked' },
            ]}
            className="w-36"
          />
          <SelectFilter
            label="Risk Level"
            value={riskLevel}
            onChange={setRiskLevel}
            options={[
              { value: 'all', label: 'All Levels' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            className="w-36"
          />
          <DateFilter label="From" value={dateFrom} onChange={setDateFrom} className="w-36" />
          <DateFilter label="To" value={dateTo} onChange={setDateTo} className="w-36" />
        </FilterBar>

        <Card noPadding>
          {loading ? (
            <LoadingState message="Loading AI interactions..." />
          ) : result && result.data.length > 0 ? (
            <>
              <DataTable columns={columns} data={result.data} keyExtractor={(i) => i.id} />
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={result.pageSize}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState title="No interactions found" description="Try adjusting your search or filter criteria." />
          )}
        </Card>
      </div>
    </Layout>
  );
}
