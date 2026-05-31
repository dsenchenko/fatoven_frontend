import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertDailyLog } from '@/api/endpoints';
import type { DailyLog, DailyLogInput } from '@/api/types';
import { parseOptionalNumber } from '@/lib/utils';

export type DailyFieldKey =
  | 'weightKg'
  | 'steps'
  | 'caloriesKcal'
  | 'fatGrams'
  | 'carbsGrams'
  | 'proteinGrams'
  | 'garminCaloriesKcal';

export const DAILY_FIELDS: DailyFieldKey[] = [
  'weightKg',
  'steps',
  'caloriesKcal',
  'fatGrams',
  'carbsGrams',
  'proteinGrams',
  'garminCaloriesKcal',
];

export type DailyFieldValues = Record<DailyFieldKey, string>;

export function logToFieldValues(log: DailyLog | null): DailyFieldValues {
  return {
    weightKg: log?.weightKg?.toString() ?? '',
    steps: log?.steps?.toString() ?? '',
    caloriesKcal: log?.caloriesKcal?.toString() ?? '',
    fatGrams: log?.fatGrams?.toString() ?? '',
    carbsGrams: log?.carbsGrams?.toString() ?? '',
    proteinGrams: log?.proteinGrams?.toString() ?? '',
    garminCaloriesKcal: log?.garminCaloriesKcal?.toString() ?? '',
  };
}

export function fieldValuesToInput(logDate: string, values: DailyFieldValues): DailyLogInput {
  const input: DailyLogInput = { logDate };
  for (const key of DAILY_FIELDS) {
    const parsed = parseOptionalNumber(values[key]);
    if (parsed !== undefined) {
      input[key] = parsed;
    }
  }
  return input;
}

export function useSaveDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertDailyLog,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daily'] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-summaries'] });
    },
  });
}
