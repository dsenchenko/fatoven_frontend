import { useMemo } from 'react';
import type { DailyLog, WeeklyAssessment, WeeklySummary } from '@/api/types';
import { ProgressCharts } from '@/features/progress/ProgressCharts';
import { useChartPreferences } from '@/hooks/useChartPreferences';
import { CHART_OPTIONS } from '@/lib/chart-preferences';
import { cn } from '@/lib/utils';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';

interface ChartsPanelProps {
  logs: DailyLog[];
  summaries: WeeklySummary[];
  assessments: WeeklyAssessment[];
  rangeFrom: string;
  rangeTo: string;
  isLoading?: boolean;
  assessmentsLoading?: boolean;
  error?: unknown;
  rangeLabel: string;
}

export function ChartsPanel({
  logs,
  summaries,
  assessments: allAssessments,
  rangeFrom,
  rangeTo,
  isLoading,
  assessmentsLoading,
  error,
  rangeLabel,
}: ChartsPanelProps) {
  const { expanded, visible, toggleExpanded, toggleChart, setAllChartsVisible } =
    useChartPreferences();

  const assessments = useMemo(() => {
    return allAssessments.filter(
      (a) => a.weekStartDate >= rangeFrom && a.weekStartDate <= rangeTo,
    );
  }, [allAssessments, rangeFrom, rangeTo]);

  const enabledCount = CHART_OPTIONS.filter((opt) => visible[opt.id]).length;
  const chartsLoading = Boolean(isLoading) || (expanded && Boolean(assessmentsLoading));
  const chartsError = error;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-violet-50/80 to-blue-50/50 pb-0">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Charts</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {rangeLabel}
              {expanded && enabledCount > 0 && ` · ${enabledCount} chart${enabledCount === 1 ? '' : 's'} enabled`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-2"
            onClick={toggleExpanded}
          >
            <ChevronIcon expanded={expanded} />
            {expanded ? 'Hide charts' : 'Show charts'}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Chart builder</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => setAllChartsVisible(true)}
                >
                  Show all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => setAllChartsVisible(false)}
                >
                  Hide all
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHART_OPTIONS.map((option) => {
                const isOn = visible[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggleChart(option.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      isOn
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {enabledCount === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Enable at least one chart above to see visualizations.
            </p>
          ) : chartsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <ProgressCharts
              logs={logs}
              summaries={summaries}
              assessments={assessments}
              error={chartsError}
              visibility={visible}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
