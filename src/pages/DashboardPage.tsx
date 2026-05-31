import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDailyLog, getDailyLogs, getWeeklySummaries } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { StatTile } from '@/components/ui/metric-ui';
import { computeDashboardOverview } from '@/lib/dashboard-stats';
import { formatDisplayDate, getISOWeekNumber, getMondayOfWeek, todayString } from '@/lib/dates';
import { formatNumber } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';

export function DashboardPage() {
  const today = todayString();
  const weekStart = getMondayOfWeek(today);
  const weekNumber = getISOWeekNumber(today);

  const todayQuery = useQuery({
    queryKey: ['daily', today],
    queryFn: () => getDailyLog(today),
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 404) {
        return false;
      }
      return count < 1;
    },
  });

  const weekLogsQuery = useQuery({
    queryKey: ['daily', 'range', weekStart, today],
    queryFn: () => getDailyLogs(weekStart, today),
  });

  const weekSummaryQuery = useQuery({
    queryKey: ['weekly-summaries', weekStart, today],
    queryFn: () => getWeeklySummaries(weekStart, today),
  });

  const log = todayQuery.data?.log;
  const isOverviewLoading = weekLogsQuery.isLoading || weekSummaryQuery.isLoading;

  const overview = computeDashboardOverview(
    weekLogsQuery.data?.logs ?? [],
    weekSummaryQuery.data?.summaries ?? [],
    today,
    weekNumber,
    weekStart,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{formatDisplayDate(today)}</p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">This week</CardTitle>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Week {overview.weekNumber}
            </span>
            <CardDescription className="m-0">
              {overview.weekStartDate} — {overview.weekEndDate}
              {' · '}
              {overview.daysLoggedThisWeek} day{overview.daysLoggedThisWeek === 1 ? '' : 's'} logged
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isOverviewLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatTile
                label="Current weight"
                value={formatNumber(overview.currentWeight)}
                sub={
                  overview.currentWeightDate
                    ? `as of ${overview.currentWeightDate}`
                    : 'No weigh-in yet'
                }
                metric="weight"
              />
              <StatTile
                label="Week avg weight"
                value={formatNumber(overview.weekAvgWeight)}
                sub="kg this week"
                metric="weight"
              />
              <StatTile
                label="Week avg steps"
                value={formatNumber(overview.weekAvgSteps, 0)}
                sub={
                  overview.todaySteps != null
                    ? `Today: ${formatNumber(overview.todaySteps, 0)}`
                    : 'steps / day'
                }
                metric="steps"
              />
              <StatTile
                label="Week avg calories"
                value={formatNumber(overview.weekAvgCalories, 0)}
                sub={
                  overview.todayCalories != null
                    ? `Today: ${formatNumber(overview.todayCalories, 0)} kcal`
                    : 'kcal logged / day'
                }
                metric="calories"
              />
              <StatTile
                label="Week avg Garmin"
                value={formatNumber(overview.weekAvgGarmin, 0)}
                sub="kcal burn / day"
                metric="garmin"
              />
              <StatTile
                label="Days logged"
                value={String(overview.daysLoggedThisWeek)}
                sub="this week"
                metric="steps"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          to="/daily"
          title="Daily Log"
          description="Enter today's metrics"
          color="border-l-blue-500"
          emoji="📝"
        />
        <QuickLink
          to="/history"
          title="History"
          description="Spreadsheet-style view"
          color="border-l-emerald-500"
          emoji="📊"
        />
        <QuickLink
          to="/"
          title="Daily log"
          description="Edit days and weekly check-ins"
          color="border-l-orange-500"
          emoji="📏"
        />
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-white to-blue-50/40">
          <CardTitle>Today&apos;s log</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {todayQuery.isLoading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}
          {!todayQuery.isLoading && todayQuery.error && !log && (
            <div className="space-y-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
              <p className="text-muted-foreground">No log for today yet.</p>
              <Link
                to="/daily"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add today&apos;s log
              </Link>
            </div>
          )}
          {log && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Weight (kg)" value={formatNumber(log.weightKg)} metric="weight" />
              <StatTile label="Steps" value={formatNumber(log.steps, 0)} metric="steps" />
              <StatTile label="Calories (kcal)" value={formatNumber(log.caloriesKcal, 0)} metric="calories" />
              <StatTile label="Garmin (kcal)" value={formatNumber(log.garminCaloriesKcal, 0)} metric="garmin" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-700 text-white shadow-lg">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Visual progress</h2>
            <p className="mt-1 max-w-md text-sm text-blue-100">
              See weight trends, steps, calories, macros, and weekly scores as interactive charts.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow transition hover:bg-blue-50"
          >
            Open daily log
            <span aria-hidden>→</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLink({
  to,
  title,
  description,
  color,
  emoji,
}: {
  to: string;
  title: string;
  description: string;
  color: string;
  emoji: string;
}) {
  return (
    <Link
      to={to}
      className={`rounded-xl border border-border/60 border-l-4 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${color}`}
    >
      <span className="text-xl">{emoji}</span>
      <h2 className="mt-2 font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
