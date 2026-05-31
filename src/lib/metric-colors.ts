export const METRIC_COLORS = {
  weight: {
    label: 'Weight',
    header: 'bg-blue-50 text-blue-800',
    cell: 'text-blue-900',
    accent: 'border-blue-500',
    dot: 'bg-blue-500',
  },
  steps: {
    label: 'Steps',
    header: 'bg-emerald-50 text-emerald-800',
    cell: 'text-emerald-900',
    accent: 'border-emerald-500',
    dot: 'bg-emerald-500',
  },
  calories: {
    label: 'kcal',
    header: 'bg-orange-50 text-orange-800',
    cell: 'text-orange-900',
    accent: 'border-orange-500',
    dot: 'bg-orange-500',
  },
  fat: {
    label: 'Fat',
    header: 'bg-amber-50 text-amber-800',
    cell: 'text-amber-900',
    accent: 'border-amber-500',
    dot: 'bg-amber-500',
  },
  carbs: {
    label: 'Carbs',
    header: 'bg-sky-50 text-sky-800',
    cell: 'text-sky-900',
    accent: 'border-sky-500',
    dot: 'bg-sky-500',
  },
  protein: {
    label: 'Protein',
    header: 'bg-rose-50 text-rose-800',
    cell: 'text-rose-900',
    accent: 'border-rose-500',
    dot: 'bg-rose-500',
  },
  garmin: {
    label: 'Garmin',
    header: 'bg-violet-50 text-violet-800',
    cell: 'text-violet-900',
    accent: 'border-violet-500',
    dot: 'bg-violet-500',
  },
} as const;

export type MetricKey = keyof typeof METRIC_COLORS;

export const WEEK_ACCENTS = [
  'border-l-blue-500',
  'border-l-emerald-500',
  'border-l-orange-500',
  'border-l-violet-500',
  'border-l-rose-500',
  'border-l-teal-500',
] as const;

export function getWeekAccent(weekNumber: number): string {
  return WEEK_ACCENTS[weekNumber % WEEK_ACCENTS.length];
}

export function isWeekend(dayOfWeek: string): boolean {
  return dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
}
