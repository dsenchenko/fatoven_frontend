import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyLog } from '@/api/types';
import { CHART_COLORS, toMacroSeries } from '@/lib/chart-data';
import { ChartCard, chartAxisStyle, chartGridStyle, chartTooltipStyle } from './ChartCard';

interface MacroStackedChartProps {
  logs: DailyLog[];
}

export function MacroStackedChart({ logs }: MacroStackedChartProps) {
  const data = toMacroSeries(logs).slice(-14);

  return (
    <ChartCard
      title="Macros (last 14 days)"
      description="Fat, carbs, and protein in grams"
      hasData={data.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} interval="preserveStartEnd" />
          <YAxis tick={chartAxisStyle} width={40} />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : 0;
              const label = typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name);
              return [`${Math.round(num)} g`, label];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="fat" name="Fat" stackId="macros" fill={CHART_COLORS.fat} radius={[0, 0, 0, 0]} />
          <Bar dataKey="carbs" name="Carbs" stackId="macros" fill={CHART_COLORS.carbs} />
          <Bar dataKey="protein" name="Protein" stackId="macros" fill={CHART_COLORS.protein} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
