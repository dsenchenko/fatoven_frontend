import { useEffect, useState } from 'react';
import type { DailyLog } from '@/api/types';
import type { DailyFieldKey, DailyFieldValues } from '@/features/history/useSaveDailyLog';
import { DAILY_FIELDS } from '@/features/history/useSaveDailyLog';
import type { MetricKey } from '@/lib/metric-colors';
import { METRIC_COLORS } from '@/lib/metric-colors';
import { cn, formatNumber } from '@/lib/utils';
import { MetricCell } from '@/components/ui/metric-ui';

const FIELD_METRIC: Record<DailyFieldKey, MetricKey> = {
  weightKg: 'weight',
  steps: 'steps',
  caloriesKcal: 'calories',
  fatGrams: 'fat',
  carbsGrams: 'carbs',
  proteinGrams: 'protein',
  garminCaloriesKcal: 'garmin',
};

interface EditableMetricCellProps {
  field: DailyFieldKey;
  value: string;
  onCommit: (field: DailyFieldKey, value: string) => Promise<void>;
  isSaving?: boolean;
}

export function EditableMetricCell({ field, value, onCommit, isSaving }: EditableMetricCellProps) {
  const [local, setLocal] = useState(value);
  const [error, setError] = useState(false);
  const metric = FIELD_METRIC[field];
  const colors = METRIC_COLORS[metric];

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const commit = async () => {
    if (local.trim() === value.trim()) return;
    setError(false);
    try {
      await onCommit(field, local.trim());
    } catch {
      setError(true);
      setLocal(value);
    }
  };

  return (
    <td className="p-0">
      <input
        type="text"
        inputMode="decimal"
        value={local}
        disabled={isSaving}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
          if (e.key === 'Escape') {
            setLocal(value);
            e.currentTarget.blur();
          }
        }}
        placeholder="—"
        className={cn(
          'h-9 w-full min-w-[4.5rem] border-0 bg-transparent px-3 py-2 text-right text-sm tabular-nums',
          'transition-colors placeholder:text-muted-foreground/30',
          'hover:bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40',
          local ? colors.cell : 'text-muted-foreground/50',
          error && 'bg-red-50 ring-2 ring-inset ring-red-300',
          isSaving && 'opacity-60',
        )}
      />
    </td>
  );
}

interface DailyLogRowProps {
  logDate: string;
  dayOfWeek: string;
  log: DailyLog | null;
  isToday: boolean;
  isEmpty: boolean;
  values: DailyFieldValues;
  onSave?: (logDate: string, field: DailyFieldKey, value: string) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
}

export function DailyLogRow({
  logDate,
  dayOfWeek,
  isToday,
  isEmpty,
  values,
  onSave,
  isSaving,
  readOnly = false,
}: DailyLogRowProps) {
  const handleCommit = async (field: DailyFieldKey, value: string) => {
    if (!onSave) return;
    await onSave(logDate, field, value);
  };

  return (
    <tr
      className={cn(
        'border-b border-border/40 transition-colors',
        isToday && 'bg-blue-50/70 ring-1 ring-inset ring-blue-200',
        !isToday && isEmpty && 'bg-slate-50/20',
        !isToday && !isEmpty && 'hover:bg-blue-50/30',
      )}
    >
      <td className="whitespace-nowrap px-3 py-2 tabular-nums font-medium text-slate-700">
        {logDate}
        {isToday && (
          <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            Today
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <DayBadge day={dayOfWeek} />
      </td>
      {DAILY_FIELDS.map((field) =>
        readOnly ? (
          <MetricCell
            key={field}
            metric={FIELD_METRIC[field]}
            value={formatReadOnlyValue(field, values[field])}
          />
        ) : (
          <EditableMetricCell
            key={field}
            field={field}
            value={values[field]}
            onCommit={handleCommit}
            isSaving={isSaving}
          />
        ),
      )}
    </tr>
  );
}

function DayBadge({ day }: { day: string }) {
  const weekend = day === 'Sat' || day === 'Sun';
  return (
    <span
      className={cn(
        'inline-flex min-w-[2.25rem] justify-center rounded-full px-2 py-0.5 text-xs font-medium',
        weekend ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600',
      )}
    >
      {day}
    </span>
  );
}

function formatReadOnlyValue(field: DailyFieldKey, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '—';
  const num = Number(trimmed);
  if (Number.isNaN(num)) return trimmed;
  if (field === 'weightKg') return formatNumber(num);
  if (field === 'steps') return formatNumber(num, 0);
  return formatNumber(num, 0);
}
