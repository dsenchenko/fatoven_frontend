import type { DailyLog, WeeklyAssessment, WeeklySummary } from '@/api/types';
import { getMondayOfWeek } from '@/lib/dates';

export const CHART_COLORS = {
  weight: '#2563eb',
  weightAvg: '#93c5fd',
  steps: '#16a34a',
  calories: '#ea580c',
  garmin: '#9333ea',
  fat: '#eab308',
  carbs: '#3b82f6',
  protein: '#ef4444',
  satiety: '#16a34a',
  calorieTracking: '#2563eb',
  sleep: '#6366f1',
  wellbeing: '#14b8a6',
  stress: '#ef4444',
  belly: '#f97316',
  neck: '#8b5cf6',
  chest: '#06b6d4',
  pulse: '#ec4899',
} as const;

export function sortLogsByDate(logs: DailyLog[]): DailyLog[] {
  return [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));
}

export function sortSummariesByDate(summaries: WeeklySummary[]): WeeklySummary[] {
  return [...summaries].sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
}

export function sortAssessmentsByDate(assessments: WeeklyAssessment[]): WeeklyAssessment[] {
  return [...assessments].sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
}

export function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${month}/${day}`;
}

export function toWeightChartData(logs: DailyLog[], summaries: WeeklySummary[]) {
  const weeklyMap = new Map(
    toWeeklyWeightAvg(summaries).map((w) => [w.weekStart, w.avgWeight]),
  );

  const byDate = new Map<
    string,
    { date: string; label: string; weight?: number; weekAvg?: number }
  >();

  toWeightSeries(logs).forEach((d) => {
    byDate.set(d.date, {
      date: d.date,
      label: d.label,
      weight: d.weight,
      weekAvg: weeklyMap.get(getMondayOfWeek(d.date)),
    });
  });

  toWeeklyWeightAvg(summaries).forEach((w) => {
    const existing = byDate.get(w.weekStart);
    if (existing) {
      existing.weekAvg = w.avgWeight;
    } else {
      byDate.set(w.weekStart, {
        date: w.weekStart,
        label: w.label,
        weekAvg: w.avgWeight,
      });
    }
  });

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function toWeightSeries(logs: DailyLog[]) {
  return sortLogsByDate(logs)
    .filter((l) => l.weightKg != null)
    .map((l) => ({
      date: l.logDate,
      label: formatShortDate(l.logDate),
      weight: l.weightKg as number,
    }));
}

export function toWeeklyWeightAvg(summaries: WeeklySummary[]) {
  return sortSummariesByDate(summaries)
    .filter((s) => s.averages.weightKg != null)
    .map((s) => ({
      week: `W${s.weekNumber}`,
      weekStart: s.weekStartDate,
      label: formatShortDate(s.weekStartDate),
      avgWeight: s.averages.weightKg as number,
    }));
}

export function toStepsSeries(logs: DailyLog[]) {
  return sortLogsByDate(logs)
    .filter((l) => l.steps != null)
    .map((l) => ({
      date: l.logDate,
      label: formatShortDate(l.logDate),
      steps: l.steps as number,
    }));
}

export function toCaloriesSeries(logs: DailyLog[]) {
  return sortLogsByDate(logs)
    .filter((l) => l.caloriesKcal != null || l.garminCaloriesKcal != null)
    .map((l) => ({
      date: l.logDate,
      label: formatShortDate(l.logDate),
      logged: l.caloriesKcal,
      garmin: l.garminCaloriesKcal,
    }));
}

export function toMacroSeries(logs: DailyLog[]) {
  return sortLogsByDate(logs)
    .filter((l) => l.fatGrams != null || l.carbsGrams != null || l.proteinGrams != null)
    .map((l) => ({
      date: l.logDate,
      label: formatShortDate(l.logDate),
      fat: l.fatGrams ?? 0,
      carbs: l.carbsGrams ?? 0,
      protein: l.proteinGrams ?? 0,
    }));
}

export function toWeeklyScoresSeries(assessments: WeeklyAssessment[]) {
  return sortAssessmentsByDate(assessments).map((a) => ({
    week: `W${a.weekNumber}`,
    weekStart: a.weekStartDate,
    label: formatShortDate(a.weekStartDate),
    satiety: a.satietyScore,
    calorieTracking: a.calorieTrackingScore,
    sleep: a.sleepScore,
    wellbeing: a.wellbeingScore,
    stress: a.stressScore,
  }));
}

export function toMeasurementsSeries(assessments: WeeklyAssessment[]) {
  return sortAssessmentsByDate(assessments)
    .filter(
      (a) =>
        a.bellyCm != null ||
        a.neckCm != null ||
        a.chestCm != null ||
        a.restingPulseBpm != null,
    )
    .map((a) => ({
      week: `W${a.weekNumber}`,
      weekStart: a.weekStartDate,
      label: formatShortDate(a.weekStartDate),
      belly: a.bellyCm,
      neck: a.neckCm,
      chest: a.chestCm,
      pulse: a.restingPulseBpm,
    }));
}

export interface ProgressStats {
  daysLogged: number;
  weightChange: number | null;
  firstWeight: number | null;
  lastWeight: number | null;
  avgSteps: number | null;
  avgCalories: number | null;
}

export function computeProgressStats(logs: DailyLog[]): ProgressStats {
  const sorted = sortLogsByDate(logs);
  const weightLogs = sorted.filter((l) => l.weightKg != null);
  const stepsLogs = sorted.filter((l) => l.steps != null);
  const calLogs = sorted.filter((l) => l.caloriesKcal != null);

  const firstWeight = weightLogs[0]?.weightKg ?? null;
  const lastWeight = weightLogs[weightLogs.length - 1]?.weightKg ?? null;

  return {
    daysLogged: sorted.length,
    firstWeight,
    lastWeight,
    weightChange:
      firstWeight != null && lastWeight != null ? lastWeight - firstWeight : null,
    avgSteps:
      stepsLogs.length > 0
        ? stepsLogs.reduce((sum, l) => sum + (l.steps ?? 0), 0) / stepsLogs.length
        : null,
    avgCalories:
      calLogs.length > 0
        ? calLogs.reduce((sum, l) => sum + (l.caloriesKcal ?? 0), 0) / calLogs.length
        : null,
  };
}
