import { useQueries } from '@tanstack/react-query';
import { getDailyLogs, getWeeklyAssessments, getWeeklySummaries } from '@/api/endpoints';

export function useProgressData(fromDate: string, toDate: string) {
  const results = useQueries({
    queries: [
      {
        queryKey: ['daily', 'range', fromDate, toDate],
        queryFn: () => getDailyLogs(fromDate, toDate),
      },
      {
        queryKey: ['weekly-summaries', fromDate, toDate],
        queryFn: () => getWeeklySummaries(fromDate, toDate),
      },
      {
        queryKey: ['weekly-assessments', 'all'],
        queryFn: () => getWeeklyAssessments(),
      },
    ],
  });

  const [logsQuery, summariesQuery, assessmentsQuery] = results;

  const assessments =
    assessmentsQuery.data?.assessments.filter(
      (a) => a.weekStartDate >= fromDate && a.weekStartDate <= toDate,
    ) ?? [];

  return {
    logs: logsQuery.data?.logs ?? [],
    summaries: summariesQuery.data?.summaries ?? [],
    assessments,
    isLoading: results.some((r) => r.isLoading),
    error: results.find((r) => r.error)?.error ?? null,
  };
}
