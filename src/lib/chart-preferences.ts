export type ChartId =
  | 'weight'
  | 'steps'
  | 'calories'
  | 'macros'
  | 'weeklyScores'
  | 'measurements';

export interface ChartPreferences {
  expanded: boolean;
  visible: Record<ChartId, boolean>;
}

export const CHART_OPTIONS: { id: ChartId; label: string }[] = [
  { id: 'weight', label: 'Weight trend' },
  { id: 'steps', label: 'Daily steps' },
  { id: 'calories', label: 'Calories vs Garmin' },
  { id: 'macros', label: 'Macros' },
  { id: 'weeklyScores', label: 'Weekly scores' },
  { id: 'measurements', label: 'Measurements' },
];

const STORAGE_KEY = 'fatoven_chart_prefs';

export const DEFAULT_CHART_VISIBILITY: Record<ChartId, boolean> = {
  weight: true,
  steps: true,
  calories: true,
  macros: false,
  weeklyScores: true,
  measurements: false,
};

const DEFAULT_PREFERENCES: ChartPreferences = {
  expanded: false,
  visible: DEFAULT_CHART_VISIBILITY,
};

const CHART_IDS = new Set<ChartId>(CHART_OPTIONS.map((o) => o.id));

function isChartId(value: string): value is ChartId {
  return CHART_IDS.has(value as ChartId);
}

export function loadChartPreferences(): ChartPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<ChartPreferences>;
    const visible = { ...DEFAULT_CHART_VISIBILITY };

    if (parsed.visible && typeof parsed.visible === 'object') {
      for (const [key, value] of Object.entries(parsed.visible)) {
        if (isChartId(key) && typeof value === 'boolean') {
          visible[key] = value;
        }
      }
    }

    return {
      expanded: Boolean(parsed.expanded),
      visible,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveChartPreferences(prefs: ChartPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
