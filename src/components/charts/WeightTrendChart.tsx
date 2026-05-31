import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyLog, WeeklySummary } from '@/api/types';
import { CHART_COLORS, toWeightChartData } from '@/lib/chart-data';
import { ChartCard, chartAxisStyle, chartGridStyle, chartTooltipStyle } from './ChartCard';

interface WeightTrendChartProps {
  logs: DailyLog[];
  summaries: WeeklySummary[];
  compact?: boolean;
}

export function WeightTrendChart({ logs, summaries, compact }: WeightTrendChartProps) {
  const data = toWeightChartData(logs, summaries);
  const hasData = data.some((d) => d.weight != null || d.weekAvg != null);
  const hasWeeklyAvg = data.some((d) => d.weekAvg != null);

  return (
    <ChartCard
      title="Weight trend"
      description={compact ? undefined : 'Daily weigh-ins with weekly averages'}
      hasData={hasData}
      height={compact ? 200 : 280}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} interval="preserveStartEnd" />
          <YAxis
            tick={chartAxisStyle}
            domain={['auto', 'auto']}
            width={40}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : null;
              if (num == null) return ['—', String(name)];
              return [`${num.toFixed(1)} kg`, name === 'weight' ? 'Weight' : 'Weekly avg'];
            }}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { date?: string } | undefined;
              return item?.date ?? '';
            }}
          />
          {!compact && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Line
            type="monotone"
            dataKey="weight"
            name="Weight"
            stroke={CHART_COLORS.weight}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS.weight }}
            connectNulls
          />
          {hasWeeklyAvg && (
            <Bar
              dataKey="weekAvg"
              name="Weekly avg"
              fill={CHART_COLORS.weightAvg}
              opacity={0.35}
              barSize={compact ? 8 : 12}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
