export interface HistoryFilterPreferences {
  weekCount: number;
}

const STORAGE_KEY = 'fatoven_history_filter_prefs';
export const DEFAULT_WEEK_COUNT = 1;
const MIN_WEEKS = 1;
const MAX_WEEKS = 520;

export function clampWeekCount(weeks: number): number {
  return Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, Math.floor(weeks) || DEFAULT_WEEK_COUNT));
}

const DEFAULT_PREFERENCES: HistoryFilterPreferences = {
  weekCount: DEFAULT_WEEK_COUNT,
};

function storageKey(scope?: string): string {
  return scope ? `${STORAGE_KEY}_${scope}` : STORAGE_KEY;
}

export function loadHistoryFilterPreferences(scope?: string): HistoryFilterPreferences {
  try {
    const raw = localStorage.getItem(storageKey(scope));
    if (!raw) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<HistoryFilterPreferences>;
    return {
      weekCount: clampWeekCount(parsed.weekCount ?? DEFAULT_WEEK_COUNT),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveHistoryFilterPreferences(prefs: HistoryFilterPreferences, scope?: string): void {
  localStorage.setItem(
    storageKey(scope),
    JSON.stringify({ weekCount: clampWeekCount(prefs.weekCount) }),
  );
}
