import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyLog } from '@/api/types';
import { CHART_COLORS, toCaloriesSeries } from '@/lib/chart-data';
import { ChartCard, chartAxisStyle, chartGridStyle, chartTooltipStyle } from './ChartCard';

interface CaloriesComparisonChartProps {
  logs: DailyLog[];
  compact?: boolean;
}

export function CaloriesComparisonChart({ logs, compact }: CaloriesComparisonChartProps) {
  const data = toCaloriesSeries(logs);

  return (
    <ChartCard
      title="Calories: logged vs Garmin"
      description={compact ? undefined : 'Compare food log calories to Garmin burn'}
      hasData={data.length > 0}
      height={compact ? 200 : 280}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} interval="preserveStartEnd" />
          <YAxis tick={chartAxisStyle} width={48} />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : null;
              if (num == null) return ['—', name === 'logged' ? 'Logged' : 'Garmin'];
              return [`${Math.round(num)} kcal`, name === 'logged' ? 'Logged' : 'Garmin'];
            }}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { date?: string } | undefined;
              return item?.date ?? '';
            }}
          />
          {!compact && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Line
            type="monotone"
            dataKey="logged"
            name="Logged"
            stroke={CHART_COLORS.calories}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="garmin"
            name="Garmin"
            stroke={CHART_COLORS.garmin}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
