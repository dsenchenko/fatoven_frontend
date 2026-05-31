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
import type { WeeklyAssessment } from '@/api/types';
import { CHART_COLORS, toMeasurementsSeries } from '@/lib/chart-data';
import { ChartCard, chartAxisStyle, chartGridStyle, chartTooltipStyle } from './ChartCard';

interface MeasurementsChartProps {
  assessments: WeeklyAssessment[];
}

export function MeasurementsChart({ assessments }: MeasurementsChartProps) {
  const data = toMeasurementsSeries(assessments);
  const hasData = data.length > 0;

  return (
    <ChartCard
      title="Body measurements"
      description="Weekly belly, neck, chest (cm) and resting pulse"
      hasData={hasData}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} interval="preserveStartEnd" />
          <YAxis yAxisId="cm" tick={chartAxisStyle} width={40} />
          <YAxis yAxisId="bpm" orientation="right" tick={chartAxisStyle} width={36} />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : null;
              const label = String(name);
              if (num == null) return ['—', label];
              const unit = label === 'Pulse' ? ' bpm' : ' cm';
              return [`${num}${unit}`, label];
            }}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { weekStart?: string; week?: string } | undefined;
              return item ? `${item.week} · ${item.weekStart}` : '';
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="cm" type="monotone" dataKey="belly" name="Belly" stroke={CHART_COLORS.belly} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line yAxisId="cm" type="monotone" dataKey="neck" name="Neck" stroke={CHART_COLORS.neck} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line yAxisId="cm" type="monotone" dataKey="chest" name="Chest" stroke={CHART_COLORS.chest} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line yAxisId="bpm" type="monotone" dataKey="pulse" name="Pulse" stroke={CHART_COLORS.pulse} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
