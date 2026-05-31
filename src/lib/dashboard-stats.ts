import type { DailyLog, WeeklySummary } from '@/api/types';
import { sortLogsByDate } from '@/lib/chart-data';

export interface DashboardOverviewStats {
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  daysLoggedThisWeek: number;
  currentWeight: number | null;
  currentWeightDate: string | null;
  weekAvgWeight: number | null;
  weekAvgSteps: number | null;
  weekAvgCalories: number | null;
  weekAvgGarmin: number | null;
  todaySteps: number | null;
  todayCalories: number | null;
}

export function computeDashboardOverview(
  logs: DailyLog[],
  summaries: WeeklySummary[],
  today: string,
  weekNumber: number,
  weekStart: string,
): DashboardOverviewStats {
  const weekLogs = sortLogsByDate(logs);
  const todayLog = weekLogs.find((l) => l.logDate === today);

  const weightLogs = weekLogs.filter((l) => l.weightKg != null);
  const latestWeightLog = weightLogs[weightLogs.length - 1];

  const currentWeekSummary = summaries.find(
    (s) => s.weekStartDate === weekStart || s.weekNumber === weekNumber,
  );

  return {
    weekNumber,
    weekStartDate: currentWeekSummary?.weekStartDate ?? weekStart,
    weekEndDate: currentWeekSummary?.weekEndDate ?? today,
    daysLoggedThisWeek: currentWeekSummary?.daysLogged ?? weekLogs.length,
    currentWeight: latestWeightLog?.weightKg ?? todayLog?.weightKg ?? null,
    currentWeightDate: latestWeightLog?.logDate ?? null,
    weekAvgWeight: currentWeekSummary?.averages.weightKg ?? null,
    weekAvgSteps: currentWeekSummary?.averages.steps ?? null,
    weekAvgCalories: currentWeekSummary?.averages.caloriesKcal ?? null,
    weekAvgGarmin: currentWeekSummary?.averages.garminCaloriesKcal ?? null,
    todaySteps: todayLog?.steps ?? null,
    todayCalories: todayLog?.caloriesKcal ?? null,
  };
}
