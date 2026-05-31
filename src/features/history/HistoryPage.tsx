import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getDailyLogs, getSharedDailyLogs, getSharedStatsProfile, getSharedWeeklyAssessments, getSharedWeeklySummaries, getWeeklyAssessments, getWeeklySummaries } from '@/api/endpoints';
import type { DailyLog, WeeklyAssessment, WeeklySummary } from '@/api/types';
import { DailyLogRow } from '@/features/history/DailyLogRow';
import { ChartsPanel } from '@/features/progress/ChartsPanel';
import { ProgressStats } from '@/features/progress/ProgressStats';
import {
  hasWeeklyCheckInData,
  WeeklyCheckInButton,
} from '@/features/weekly/WeeklyCheckInDialog';
import { useAuth } from '@/hooks/useAuth';
import {
  DAILY_FIELDS,
  fieldValuesToInput,
  logToFieldValues,
  useSaveDailyLog,
  type DailyFieldKey,
  type DailyFieldValues,
} from '@/features/history/useSaveDailyLog';
import {
  createdAtToLocalDate,
  enumerateDates,
  getDayOfWeekShort,
  getISOWeekNumber,
  getMondayOfWeek,
  normalizeDateRange,
  resolveTrackingStartDate,
  todayString,
  weeksAgo,
} from '@/lib/dates';
import { getWeekAccent } from '@/lib/metric-colors';
import {
  clampWeekCount,
  loadHistoryFilterPreferences,
  saveHistoryFilterPreferences,
} from '@/lib/history-filter-preferences';
import { cn, formatNumber } from '@/lib/utils';
import { MetricCell, MetricHeader } from '@/components/ui/metric-ui';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

function createInitialHistoryFilter(today: string, scope?: string) {
  const { weekCount } = loadHistoryFilterPreferences(scope);
  return {
    weekCount,
    fromDate: weeksAgo(today, weekCount),
    toDate: today,
  };
}

interface DayRow {
  logDate: string;
  dayOfWeek: string;
  weekNumber: number;
  log: DailyLog | null;
}

interface HistoryViewProps {
  username?: string;
  readOnly?: boolean;
}

export function HistoryPage() {
  return <HistoryView />;
}

export function SharedStatsView({ username }: { username: string }) {
  return <HistoryView username={username} readOnly />;
}

function HistoryView({ username, readOnly = false }: HistoryViewProps) {
  const today = todayString();
  const { user } = useAuth();
  const filterScope = username;
  const initialFilter = useMemo(() => createInitialHistoryFilter(today, filterScope), [today, filterScope]);

  const [weekCount, setWeekCount] = useState(initialFilter.weekCount);
  const [fromDate, setFromDate] = useState(initialFilter.fromDate);
  const [toDate, setToDate] = useState(initialFilter.toDate);
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set());
  const [draftOverrides, setDraftOverrides] = useState<Record<string, DailyFieldValues>>({});
  const scrollRestoreY = useRef<number | null>(null);

  useEffect(() => {
    saveHistoryFilterPreferences({ weekCount }, filterScope);
  }, [weekCount, filterScope]);

  const applyWeekCount = (weeks: number, anchorTo: string = toDate) => {
    const clamped = clampWeekCount(weeks);
    setWeekCount(clamped);
    setFromDate(weeksAgo(anchorTo, clamped));
  };

  const handleCurrentWeek = () => {
    setToDate(today);
    setFromDate(getMondayOfWeek(today));
    setWeekCount(1);
  };

  const handleToDateChange = (nextTo: string) => {
    setToDate(nextTo);
    setFromDate(weeksAgo(nextTo, weekCount));
  };

  const { from: rangeFrom, to: rangeTo } = normalizeDateRange(fromDate, toDate, today);

  const sharedProfileQuery = useQuery({
    queryKey: ['shared-stats-profile', username],
    queryFn: () => getSharedStatsProfile(username!),
    enabled: Boolean(user && username),
  });

  const sharedProfile = sharedProfileQuery.data?.profile;
  const queriesEnabled = Boolean(user) && (!username || Boolean(sharedProfile));

  const allLogsQuery = useQuery({
    queryKey: ['daily', username ? 'shared-all' : 'all', username],
    queryFn: () => (username ? getSharedDailyLogs(username) : getDailyLogs()),
    enabled: queriesEnabled,
  });

  const historyStart = useMemo(() => {
    const createdAt = username ? sharedProfile?.createdAt : user?.createdAt;
    if (!createdAt) return today;
    return resolveTrackingStartDate(createdAt, allLogsQuery.data?.logs ?? []);
  }, [user, username, sharedProfile?.createdAt, allLogsQuery.data?.logs, today]);

  const logsQuery = useQuery({
    queryKey: ['daily', username ? 'shared-range' : 'range', username, rangeFrom, rangeTo],
    queryFn: () =>
      username
        ? getSharedDailyLogs(username, rangeFrom, rangeTo)
        : getDailyLogs(rangeFrom, rangeTo),
    enabled: queriesEnabled,
    placeholderData: keepPreviousData,
  });

  const summariesQuery = useQuery({
    queryKey: ['weekly-summaries', username ?? 'me', rangeFrom, rangeTo],
    queryFn: () =>
      username
        ? getSharedWeeklySummaries(username, rangeFrom, rangeTo)
        : getWeeklySummaries(rangeFrom, rangeTo),
    enabled: queriesEnabled,
    placeholderData: keepPreviousData,
  });

  const assessmentsQuery = useQuery({
    queryKey: ['weekly-assessments', username ?? 'me'],
    queryFn: () =>
      username ? getSharedWeeklyAssessments(username) : getWeeklyAssessments(),
    enabled: queriesEnabled,
  });

  const saveMutation = useSaveDailyLog();

  const logs = logsQuery.data?.logs ?? [];
  const totalLogs = allLogsQuery.data?.logs?.length ?? 0;

  const dayRows = useMemo((): DayRow[] => {
    const logMap = new Map(logs.map((l) => [l.logDate, l]));
    return enumerateDates(rangeFrom, rangeTo)
      .reverse()
      .map((date) => ({
        logDate: date,
        dayOfWeek: getDayOfWeekShort(date),
        weekNumber: getISOWeekNumber(date),
        log: logMap.get(date) ?? null,
      }));
  }, [logs, rangeFrom, rangeTo]);

  const grouped = useMemo(() => {
    const summaries = summariesQuery.data?.summaries ?? [];
    const summaryByWeek = new Map<number, WeeklySummary>();
    summaries.forEach((s) => summaryByWeek.set(s.weekNumber, s));

    const groups = new Map<number, DayRow[]>();
    dayRows.forEach((row) => {
      const existing = groups.get(row.weekNumber) ?? [];
      existing.push(row);
      groups.set(row.weekNumber, existing);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => b - a)
      .map(([weekNumber, rows]) => ({
        weekNumber,
        rows,
        summary: summaryByWeek.get(weekNumber),
      }));
  }, [dayRows, summariesQuery.data]);

  const assessmentByWeekStart = useMemo(() => {
    const map = new Map<string, WeeklyAssessment>();
    (assessmentsQuery.data?.assessments ?? []).forEach((assessment) => {
      map.set(assessment.weekStartDate, assessment);
    });
    return map;
  }, [assessmentsQuery.data?.assessments]);

  const getRowValues = useCallback(
    (row: DayRow): DailyFieldValues => {
      const draft = draftOverrides[row.logDate];
      if (draft) return draft;
      return logToFieldValues(row.log);
    },
    [draftOverrides],
  );

  const handleSaveField = useCallback(
    async (logDate: string, field: DailyFieldKey, rawValue: string) => {
      if (readOnly) return;
      const row = dayRows.find((r) => r.logDate === logDate);
      if (!row) return;

      const current = getRowValues(row);
      const next: DailyFieldValues = { ...current, [field]: rawValue };

      setDraftOverrides((prev) => ({ ...prev, [logDate]: next }));
      setPendingDates((prev) => new Set(prev).add(logDate));

      try {
        await saveMutation.mutateAsync(fieldValuesToInput(logDate, next));
        setDraftOverrides((prev) => {
          const copy = { ...prev };
          delete copy[logDate];
          return copy;
        });
      } finally {
        setPendingDates((prev) => {
          const copy = new Set(prev);
          copy.delete(logDate);
          return copy;
        });
      }
    },
    [dayRows, getRowValues, saveMutation, readOnly],
  );

  const ownerLabel = sharedProfile?.displayName || sharedProfile?.username || username;

  const isInitialLoading =
    (username ? sharedProfileQuery.isPending : false) ||
    allLogsQuery.isPending ||
    logsQuery.isPending;
  const isRangeFetching = logsQuery.isFetching || summariesQuery.isFetching;
  const error =
    sharedProfileQuery.error ||
    logsQuery.error ||
    allLogsQuery.error ||
    summariesQuery.error;
  const rangeHasNoLogs = !isInitialLoading && logs.length === 0 && totalLogs > 0;
  const earliestWeekStart = getMondayOfWeek(historyStart);
  const canLoadMoreWeeks = rangeFrom > earliestWeekStart;

  useLayoutEffect(() => {
    if (scrollRestoreY.current == null) return;
    window.scrollTo(0, scrollRestoreY.current);
    scrollRestoreY.current = null;
  }, [rangeFrom, grouped.length]);

  const handleShowOneMoreWeek = () => {
    scrollRestoreY.current = window.scrollY;
    const nextWeekCount = weekCount + 1;
    const nextFrom = weeksAgo(toDate, nextWeekCount);
    setWeekCount(nextWeekCount);
    setFromDate(nextFrom < earliestWeekStart ? earliestWeekStart : nextFrom);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {readOnly && ownerLabel ? `${ownerLabel}'s stats` : 'Daily log'}
          </h1>
          <p className="text-muted-foreground">
            {readOnly ? 'Read-only view' : 'Click any cell to edit'} · {dayRows.length} days shown
            {logs.length > 0 && ` · ${logs.length} with data`}
            {!isInitialLoading && totalLogs > 0 && logs.length === 0 && ` · ${totalLogs} total entries`}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/50 pb-4">
          <CardTitle className="text-base">Date range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="weeks">Show weeks</Label>
              <Input
                id="weeks"
                type="number"
                min={1}
                max={520}
                value={weekCount}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!Number.isNaN(n)) applyWeekCount(n, toDate);
                }}
                className="w-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                max={rangeTo}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="date"
                value={toDate}
                min={rangeFrom}
                max={today}
                onChange={(e) => handleToDateChange(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" className="h-9 shrink-0" onClick={handleCurrentWeek}>
              Current week
            </Button>
          </div>
          {(user || sharedProfile) && (
            <p className="text-xs text-muted-foreground">
              {readOnly && sharedProfile ? (
                <>
                  @{sharedProfile.username}
                  {sharedProfile.displayName && ` · ${sharedProfile.displayName}`} · tracking since{' '}
                  {createdAtToLocalDate(sharedProfile.createdAt)}
                </>
              ) : (
                <>
                  Account since {createdAtToLocalDate(user!.createdAt)} · earliest entry {historyStart}
                </>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {rangeHasNoLogs && (
        <Alert>
          You have {totalLogs} saved entries, but none in this date range. Increase the
          weeks value or set an earlier From date.
        </Alert>
      )}

      {!isInitialLoading && <ProgressStats logs={logs} />}

      <ChartsPanel
        logs={logs}
        summaries={summariesQuery.data?.summaries ?? []}
        assessments={assessmentsQuery.data?.assessments ?? []}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        isLoading={isInitialLoading}
        assessmentsLoading={assessmentsQuery.isLoading}
        error={logsQuery.error || summariesQuery.error}
        rangeLabel={`${rangeFrom} — ${rangeTo}`}
      />

      {isInitialLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <ApiErrorAlert error={error} />
        </div>
      )}

      {!isInitialLoading && dayRows.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Invalid date range. Adjust the filters above.
          </CardContent>
        </Card>
      )}

      {!isInitialLoading &&
        grouped.map(({ weekNumber, rows, summary }) => (
          <WeekGroup
            key={weekNumber}
            weekNumber={weekNumber}
            rows={rows}
            summary={summary}
            assessment={assessmentByWeekStart.get(
              summary?.weekStartDate ?? getMondayOfWeek(rows[0]?.logDate ?? today),
            )}
            today={today}
            getRowValues={getRowValues}
            onSaveField={handleSaveField}
            pendingDates={pendingDates}
            readOnly={readOnly}
            statsUsername={username}
          />
        ))}

      {!isInitialLoading && grouped.length > 0 && canLoadMoreWeeks && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleShowOneMoreWeek}
            disabled={isRangeFetching}
          >
            {isRangeFetching ? 'Loading…' : 'Show 1 more week'}
          </Button>
        </div>
      )}
    </div>
  );
}

function WeekGroup({
  weekNumber,
  rows,
  summary,
  assessment,
  today,
  getRowValues,
  onSaveField,
  pendingDates,
  readOnly = false,
  statsUsername,
}: {
  weekNumber: number;
  rows: DayRow[];
  summary?: WeeklySummary;
  assessment?: WeeklyAssessment;
  today: string;
  getRowValues: (row: DayRow) => DailyFieldValues;
  onSaveField: (logDate: string, field: DailyFieldKey, value: string) => Promise<void>;
  pendingDates: Set<string>;
  readOnly?: boolean;
  statsUsername?: string;
}) {
  const accent = getWeekAccent(weekNumber);
  const daysWithData = rows.filter((r) => r.log !== null).length;
  const weekStartDate = summary?.weekStartDate ?? getMondayOfWeek(rows[0]?.logDate ?? today);
  const hasCheckIn = hasWeeklyCheckInData(assessment);

  return (
    <Card className={cn('overflow-hidden border-l-4 shadow-sm', accent)}>
      <div className="border-b bg-gradient-to-r from-white to-slate-50/80 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              Week {weekNumber}
            </span>
            {summary && (
              <span className="text-sm text-muted-foreground">
                {summary.weekStartDate} — {summary.weekEndDate}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {daysWithData}/{rows.length} days filled
            </span>
          </div>
          <WeeklyCheckInButton
            weekStartDate={weekStartDate}
            weekNumber={weekNumber}
            hasExistingCheckIn={hasCheckIn}
            statsUsername={statsUsername}
            readOnly={readOnly}
          />
        </div>
      </div>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Date
              </th>
              <th className="bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Day
              </th>
              <MetricHeader metric="weight" />
              <MetricHeader metric="steps" />
              <MetricHeader metric="calories" />
              <MetricHeader metric="fat" />
              <MetricHeader metric="carbs" />
              <MetricHeader metric="protein" />
              <MetricHeader metric="garmin" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = getRowValues(row);
              const isEmpty = DAILY_FIELDS.every((f) => values[f].trim() === '');
              return (
                <DailyLogRow
                  key={row.logDate}
                  logDate={row.logDate}
                  dayOfWeek={row.dayOfWeek}
                  log={row.log}
                  isToday={row.logDate === today}
                  isEmpty={isEmpty && row.log === null}
                  values={values}
                  onSave={readOnly ? undefined : onSaveField}
                  isSaving={pendingDates.has(row.logDate)}
                  readOnly={readOnly}
                />
              );
            })}
          </tbody>
          {summary && (
            <tfoot>
              <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 font-semibold">
                <td colSpan={2} className="px-3 py-3 text-emerald-900">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Avg ({summary.daysLogged} days)
                  </span>
                </td>
                <MetricCell metric="weight" value={formatNumber(summary.averages.weightKg)} className="font-bold" />
                <MetricCell metric="steps" value={formatNumber(summary.averages.steps, 0)} className="font-bold" />
                <MetricCell metric="calories" value={formatNumber(summary.averages.caloriesKcal, 0)} className="font-bold" />
                <td colSpan={3} className="px-3 py-2 text-center text-xs text-muted-foreground">—</td>
                <MetricCell metric="garmin" value={formatNumber(summary.averages.garminCaloriesKcal, 0)} className="font-bold" />
              </tr>
            </tfoot>
          )}
        </table>
      </CardContent>
    </Card>
  );
}
