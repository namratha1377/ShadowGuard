import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#171717',
    border: '1px solid #262626',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#FFFFFF',
  },
  itemStyle: { color: '#A3A3A3' },
  labelStyle: { color: '#FFFFFF', fontWeight: 600 },
};

interface ActivityChartProps {
  data: { date: string; allowed: number; restricted: number; blocked: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
        <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 11 }} axisLine={{ stroke: '#262626' }} tickLine={false} />
        <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={{ stroke: '#262626' }} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#A3A3A3' }} />
        <Area type="monotone" dataKey="allowed" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} />
        <Area type="monotone" dataKey="restricted" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
        <Area type="monotone" dataKey="blocked" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface RiskDistributionChartProps {
  data: { level: string; count: number; color: string }[];
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="level"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.level} fill={entry.color} fillOpacity={entry.level === 'Low' ? 0.5 : 0.85} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#A3A3A3' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface TopAppsChartProps {
  data: { name: string; requests: number; riskScore: number }[];
}

export function TopAppsChart({ data }: TopAppsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#737373', fontSize: 11 }} axisLine={{ stroke: '#262626' }} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#A3A3A3', fontSize: 11 }} axisLine={{ stroke: '#262626' }} tickLine={false} width={110} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="requests" fill="#FFFFFF" fillOpacity={0.7} radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TrendChartProps {
  data: Record<string, string | number>[];
  dataKeys: { key: string; color: string; label: string }[];
  height?: number;
}

export function TrendChart({ data, dataKeys, height = 200 }: TrendChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
        <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 10 }} axisLine={{ stroke: '#262626' }} tickLine={false} />
        <YAxis tick={{ fill: '#737373', fontSize: 10 }} axisLine={{ stroke: '#262626' }} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '10px', color: '#A3A3A3' }} />
        {dataKeys.map((dk) => (
          <Area
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            name={dk.label}
            stroke={dk.color}
            fill={dk.color}
            fillOpacity={0.1}
            stackId="1"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface RiskTrendChartProps {
  data: { date: string; low: number; medium: number; high: number; critical: number }[];
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  return (
    <TrendChart
      data={data}
      dataKeys={[
        { key: 'low', color: '#737373', label: 'Low' },
        { key: 'medium', color: '#F59E0B', label: 'Medium' },
        { key: 'high', color: '#EF4444', label: 'High' },
        { key: 'critical', color: '#DC2626', label: 'Critical' },
      ]}
      height={220}
    />
  );
}

interface DataTypeTrendChartProps {
  data: { date: string; PII: number; 'Source Code': number; Financial: number; 'Confidential Documents': number }[];
}

export function DataTypeTrendChart({ data }: DataTypeTrendChartProps) {
  return (
    <TrendChart
      data={data}
      dataKeys={[
        { key: 'PII', color: '#3B82F6', label: 'PII' },
        { key: 'Source Code', color: '#F59E0B', label: 'Source Code' },
        { key: 'Financial', color: '#EF4444', label: 'Financial' },
        { key: 'Confidential Documents', color: '#A855F7', label: 'Confidential Docs' },
      ]}
      height={220}
    />
  );
}
