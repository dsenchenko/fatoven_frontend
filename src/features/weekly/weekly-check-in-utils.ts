import { z } from 'zod';
import type { WeeklyAssessment } from '@/api/types';

const scoreSchema = z
  .string()
  .optional()
  .refine((v) => !v || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 10), {
    message: 'Score must be 1–10',
  });

export const weeklyCheckInSchema = z.object({
  weekStartDate: z.string(),
  restingPulseBpm: z.string().optional(),
  bellyCm: z.string().optional(),
  neckCm: z.string().optional(),
  chestCm: z.string().optional(),
  satietyScore: scoreSchema,
  calorieTrackingScore: scoreSchema,
  sleepScore: scoreSchema,
  wellbeingScore: scoreSchema,
  stressScore: scoreSchema,
  notes: z.string().optional(),
});

export type WeeklyCheckInForm = z.infer<typeof weeklyCheckInSchema>;

export function emptyWeeklyCheckInForm(weekStart: string): WeeklyCheckInForm {
  return {
    weekStartDate: weekStart,
    restingPulseBpm: '',
    bellyCm: '',
    neckCm: '',
    chestCm: '',
    satietyScore: '',
    calorieTrackingScore: '',
    sleepScore: '',
    wellbeingScore: '',
    stressScore: '',
    notes: '',
  };
}

export function assessmentToWeeklyCheckInForm(a: WeeklyAssessment): WeeklyCheckInForm {
  return {
    weekStartDate: a.weekStartDate,
    restingPulseBpm: a.restingPulseBpm?.toString() ?? '',
    bellyCm: a.bellyCm?.toString() ?? '',
    neckCm: a.neckCm?.toString() ?? '',
    chestCm: a.chestCm?.toString() ?? '',
    satietyScore: a.satietyScore?.toString() ?? '',
    calorieTrackingScore: a.calorieTrackingScore?.toString() ?? '',
    sleepScore: a.sleepScore?.toString() ?? '',
    wellbeingScore: a.wellbeingScore?.toString() ?? '',
    stressScore: a.stressScore?.toString() ?? '',
    notes: a.notes ?? '',
  };
}

export function hasWeeklyCheckInData(assessment?: WeeklyAssessment | null): boolean {
  if (!assessment) return false;

  return [
    assessment.restingPulseBpm,
    assessment.bellyCm,
    assessment.neckCm,
    assessment.chestCm,
    assessment.satietyScore,
    assessment.calorieTrackingScore,
    assessment.sleepScore,
    assessment.wellbeingScore,
    assessment.stressScore,
    assessment.notes,
  ].some((value) => value != null && value !== '');
}
