import { apiBlobRequest, apiFormRequest, apiRequest } from './client';
import type {
  AuthResponse,
  DailyLog,
  DailyLogInput,
  PublicStatsProfile,
  SpreadsheetImportMode,
  SpreadsheetImportResult,
  User,
  WeeklyAssessment,
  WeeklyAssessmentInput,
  WeeklySummary,
} from './types';

export async function register(
  email: string,
  password: string,
  displayName?: string,
  username?: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    auth: false,
    body: { email, password, displayName, username },
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
}

export async function getMe(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/api/v1/auth/me');
}

export async function updateUsername(username: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/api/v1/auth/username', {
    method: 'PATCH',
    body: { username },
  });
}

export async function getSharedStatsProfile(username: string): Promise<{ profile: PublicStatsProfile }> {
  return apiRequest<{ profile: PublicStatsProfile }>(`/api/v1/stats/${encodeURIComponent(username)}`);
}

export async function getSharedDailyLogs(
  username: string,
  from?: string,
  to?: string,
): Promise<{ logs: DailyLog[] }> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  return apiRequest<{ logs: DailyLog[] }>(
    `/api/v1/stats/${encodeURIComponent(username)}/daily${query ? `?${query}` : ''}`,
  );
}

export async function getSharedWeeklySummaries(
  username: string,
  from: string,
  to: string,
): Promise<{ summaries: WeeklySummary[] }> {
  const params = new URLSearchParams({ from, to });
  return apiRequest<{ summaries: WeeklySummary[] }>(
    `/api/v1/stats/${encodeURIComponent(username)}/weekly/summaries?${params}`,
  );
}

export async function getSharedWeeklyAssessments(
  username: string,
): Promise<{ assessments: WeeklyAssessment[] }> {
  return apiRequest<{ assessments: WeeklyAssessment[] }>(
    `/api/v1/stats/${encodeURIComponent(username)}/weekly/assessments`,
  );
}

export async function getSharedWeeklyAssessment(
  username: string,
  weekStartDate: string,
): Promise<{ assessment: WeeklyAssessment }> {
  return apiRequest<{ assessment: WeeklyAssessment }>(
    `/api/v1/stats/${encodeURIComponent(username)}/weekly/assessments/${weekStartDate}`,
  );
}

export async function upsertDailyLog(input: DailyLogInput): Promise<{ log: DailyLog }> {
  return apiRequest<{ log: DailyLog }>('/api/v1/tracking/daily', {
    method: 'PUT',
    body: input,
  });
}

export async function getDailyLogs(
  from?: string,
  to?: string,
): Promise<{ logs: DailyLog[] }> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  return apiRequest<{ logs: DailyLog[] }>(
    `/api/v1/tracking/daily${query ? `?${query}` : ''}`,
  );
}

export async function getWeeklySummaries(
  from: string,
  to: string,
): Promise<{ summaries: WeeklySummary[] }> {
  const params = new URLSearchParams({ from, to });
  return apiRequest<{ summaries: WeeklySummary[] }>(
    `/api/v1/tracking/weekly/summaries?${params}`,
  );
}

export async function upsertWeeklyAssessment(
  input: WeeklyAssessmentInput,
): Promise<{ assessment: WeeklyAssessment }> {
  return apiRequest<{ assessment: WeeklyAssessment }>('/api/v1/tracking/weekly/assessments', {
    method: 'PUT',
    body: input,
  });
}

export async function getWeeklyAssessments(): Promise<{ assessments: WeeklyAssessment[] }> {
  return apiRequest<{ assessments: WeeklyAssessment[] }>('/api/v1/tracking/weekly/assessments');
}

export async function getWeeklyAssessment(
  weekStartDate: string,
): Promise<{ assessment: WeeklyAssessment }> {
  return apiRequest<{ assessment: WeeklyAssessment }>(
    `/api/v1/tracking/weekly/assessments/${weekStartDate}`,
  );
}

export async function exportTrackingSpreadsheet(from?: string, to?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  return apiBlobRequest(`/api/v1/tracking/export${query ? `?${query}` : ''}`);
}

export async function importTrackingSpreadsheet(
  file: File,
  mode: SpreadsheetImportMode = 'merge',
): Promise<SpreadsheetImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFormRequest<SpreadsheetImportResult>(
    `/api/v1/tracking/import?mode=${mode}`,
    formData,
  );
}
