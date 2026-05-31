import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyLog } from '@/api/types';
import { CHART_COLORS, toStepsSeries } from '@/lib/chart-data';
import { ChartCard, chartAxisStyle, chartGridStyle, chartTooltipStyle } from './ChartCard';

interface StepsBarChartProps {
  logs: DailyLog[];
  compact?: boolean;
}

export function StepsBarChart({ logs, compact }: StepsBarChartProps) {
  const data = toStepsSeries(logs);

  return (
    <ChartCard
      title="Daily steps"
      description={compact ? undefined : 'Steps logged each day'}
      hasData={data.length > 0}
      height={compact ? 200 : 280}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} interval="preserveStartEnd" />
          <YAxis tick={chartAxisStyle} width={48} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value) => [
              typeof value === 'number' ? value.toLocaleString() : '—',
              'Steps',
            ]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { date?: string } | undefined;
              return item?.date ?? '';
            }}
          />
          <Bar dataKey="steps" fill={CHART_COLORS.steps} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
