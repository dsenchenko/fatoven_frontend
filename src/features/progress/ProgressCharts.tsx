import type { DailyLog, WeeklyAssessment, WeeklySummary } from '@/api/types';
import { CaloriesComparisonChart } from '@/components/charts/CaloriesComparisonChart';
import { MacroStackedChart } from '@/components/charts/MacroStackedChart';
import { MeasurementsChart } from '@/components/charts/MeasurementsChart';
import { StepsBarChart } from '@/components/charts/StepsBarChart';
import { WeeklyScoresChart } from '@/components/charts/WeeklyScoresChart';
import { WeightTrendChart } from '@/components/charts/WeightTrendChart';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import type { ChartId } from '@/lib/chart-preferences';
import { cn } from '@/lib/utils';

interface ProgressChartsProps {
  logs: DailyLog[];
  summaries: WeeklySummary[];
  assessments: WeeklyAssessment[];
  error?: unknown;
  visibility: Record<ChartId, boolean>;
  className?: string;
}

export function ProgressCharts({
  logs,
  summaries,
  assessments,
  error,
  visibility,
  className,
}: ProgressChartsProps) {
  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <ApiErrorAlert error={error} />
      </div>
    );
  }

  const dailyCharts = [visibility.weight, visibility.steps, visibility.calories, visibility.macros];
  const hasDailyCharts = dailyCharts.some(Boolean);
  const hasWeeklyCharts = visibility.weeklyScores || visibility.measurements;

  if (logs.length === 0 && !hasWeeklyCharts) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Log data in the selected date range to see charts.
      </p>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {hasDailyCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibility.weight && <WeightTrendChart logs={logs} summaries={summaries} />}
          {visibility.steps && <StepsBarChart logs={logs} />}
          {visibility.calories && <CaloriesComparisonChart logs={logs} />}
          {visibility.macros && <MacroStackedChart logs={logs} />}
        </div>
      )}

      {hasWeeklyCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibility.weeklyScores && <WeeklyScoresChart assessments={assessments} />}
          {visibility.measurements && <MeasurementsChart assessments={assessments} />}
        </div>
      )}
    </div>
  );
}
