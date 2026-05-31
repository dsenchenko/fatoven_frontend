export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  createdAt: string;
}

export interface PublicStatsProfile {
  id: string;
  username: string;
  displayName: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiErrorBody {
  error: string;
  message: string;
  details?: unknown;
}

export interface DailyLog {
  id: string;
  logDate: string;
  dayOfWeek: string;
  weekNumber: number;
  weightKg: number | null;
  steps: number | null;
  caloriesKcal: number | null;
  fatGrams: number | null;
  carbsGrams: number | null;
  proteinGrams: number | null;
  garminCaloriesKcal: number | null;
  notes: string | null;
}

export interface DailyLogInput {
  logDate: string;
  weightKg?: number;
  steps?: number;
  caloriesKcal?: number;
  fatGrams?: number;
  carbsGrams?: number;
  proteinGrams?: number;
  garminCaloriesKcal?: number;
  notes?: string;
}

export interface WeeklySummary {
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  daysLogged: number;
  averages: {
    weightKg: number | null;
    steps: number | null;
    caloriesKcal: number | null;
    garminCaloriesKcal: number | null;
  };
}

export interface WeeklyAssessment {
  id: string;
  weekStartDate: string;
  weekNumber: number;
  restingPulseBpm: number | null;
  bellyCm: number | null;
  neckCm: number | null;
  chestCm: number | null;
  satietyScore: number | null;
  calorieTrackingScore: number | null;
  sleepScore: number | null;
  wellbeingScore: number | null;
  stressScore: number | null;
  notes: string | null;
}

export interface WeeklyAssessmentInput {
  weekStartDate: string;
  weekNumber: number;
  restingPulseBpm?: number;
  bellyCm?: number;
  neckCm?: number;
  chestCm?: number;
  satietyScore?: number;
  calorieTrackingScore?: number;
  sleepScore?: number;
  wellbeingScore?: number;
  stressScore?: number;
  notes?: string;
}

export type SpreadsheetImportMode = 'merge' | 'replace';

export interface SpreadsheetImportResult {
  mode: SpreadsheetImportMode;
  imported: {
    dailyLogs: number;
    weeklyAssessments: number;
  };
  dateRange: {
    from: string | null;
    to: string | null;
  };
}
