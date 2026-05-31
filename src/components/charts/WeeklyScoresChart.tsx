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
import { CHART_COLORS, toWeeklyScoresSeries } from '@/lib/chart-data';
import { ChartCard, chartAxisStyle, chartGridStyle, chartTooltipStyle } from './ChartCard';

interface WeeklyScoresChartProps {
  assessments: WeeklyAssessment[];
}

const SCORE_LINES = [
  { key: 'satiety', name: 'Satiety', color: CHART_COLORS.satiety },
  { key: 'calorieTracking', name: 'Calorie tracking', color: CHART_COLORS.calorieTracking },
  { key: 'sleep', name: 'Sleep', color: CHART_COLORS.sleep },
  { key: 'wellbeing', name: 'Wellbeing', color: CHART_COLORS.wellbeing },
  { key: 'stress', name: 'Stress', color: CHART_COLORS.stress },
] as const;

export function WeeklyScoresChart({ assessments }: WeeklyScoresChartProps) {
  const data = toWeeklyScoresSeries(assessments);
  const hasData = data.some((d) =>
    SCORE_LINES.some((line) => d[line.key] != null),
  );

  return (
    <ChartCard
      title="Weekly scores (1–10)"
      description="Subjective check-in scores over time"
      hasData={hasData}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...chartGridStyle} vertical={false} />
          <XAxis dataKey="label" tick={chartAxisStyle} interval="preserveStartEnd" />
          <YAxis tick={chartAxisStyle} domain={[1, 10]} width={30} ticks={[1, 3, 5, 7, 10]} />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value) => [typeof value === 'number' ? value : '—', '']}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { weekStart?: string; week?: string } | undefined;
              return item ? `${item.week} · ${item.weekStart}` : '';
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {SCORE_LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
