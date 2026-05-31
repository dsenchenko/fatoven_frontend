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

interface DayBadgeProps {
  day: string;
}

export function DayBadge({ day }: DayBadgeProps) {
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

interface StatTileProps {
  label: string;
  value: string;
  metric: MetricKey;
  sub?: string;
  className?: string;
}

export function StatTile({ label, value, metric, sub, className }: StatTileProps) {
  const colors = METRIC_COLORS[metric];

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card p-4 shadow-sm',
        'border-l-4',
        colors.accent,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className={cn('mt-2 text-2xl font-bold tabular-nums', colors.cell)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface QuickActionCardProps {
  to: string;
  title: string;
  description: string;
  accent: string;
  icon: React.ReactNode;
}

export function QuickActionCard({ to, title, description, accent, icon }: QuickActionCardProps) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = to;
      }}
      className={cn(
        'group block rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        'border-l-4',
        accent,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-muted/80 p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </a>
  );
}
