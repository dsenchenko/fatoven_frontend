import { cn } from '@/lib/utils';
import type { MetricKey } from '@/lib/metric-colors';
import { METRIC_COLORS } from '@/lib/metric-colors';

interface MetricCellProps {
  value: string;
  metric: MetricKey;
  className?: string;
}

export function MetricCell({ value, metric, className }: MetricCellProps) {
  const isEmpty = value === '—';

  return (
    <td
      className={cn(
        'px-3 py-2 text-right tabular-nums',
        isEmpty ? 'text-muted-foreground/40' : METRIC_COLORS[metric].cell,
        className,
      )}
    >
      {isEmpty ? '·' : value}
    </td>
  );
}

interface MetricHeaderProps {
  metric: MetricKey;
  align?: 'left' | 'right';
}

export function MetricHeader({ metric, align = 'right' }: MetricHeaderProps) {
  const colors = METRIC_COLORS[metric];
  return (
    <th
      className={cn(
        'px-3 py-2.5 text-xs font-semibold uppercase tracking-wide',
        colors.header,
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {colors.label}
    </th>
  );
}
