import { useCallback, useEffect, useState } from 'react';
import {
  loadChartPreferences,
  saveChartPreferences,
  type ChartId,
  type ChartPreferences,
} from '@/lib/chart-preferences';

export function useChartPreferences() {
  const [prefs, setPrefs] = useState<ChartPreferences>(() => loadChartPreferences());

  useEffect(() => {
    saveChartPreferences(prefs);
  }, [prefs]);

  const setExpanded = useCallback((expanded: boolean) => {
    setPrefs((current) => ({ ...current, expanded }));
  }, []);

  const toggleExpanded = useCallback(() => {
    setPrefs((current) => ({ ...current, expanded: !current.expanded }));
  }, []);

  const toggleChart = useCallback((id: ChartId) => {
    setPrefs((current) => ({
      ...current,
      visible: { ...current.visible, [id]: !current.visible[id] },
    }));
  }, []);

  const setAllChartsVisible = useCallback((visible: boolean) => {
    setPrefs((current) => ({
      ...current,
      visible: Object.fromEntries(
        Object.keys(current.visible).map((key) => [key, visible]),
      ) as ChartPreferences['visible'],
    }));
  }, []);

  return {
    expanded: prefs.expanded,
    visible: prefs.visible,
    setExpanded,
    toggleExpanded,
    toggleChart,
    setAllChartsVisible,
  };
}
