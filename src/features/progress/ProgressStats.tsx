import type { DailyLog } from '@/api/types';
import { Card, CardContent } from '@/components/ui';
import { computeProgressStats } from '@/lib/chart-data';
import { cn, formatNumber } from '@/lib/utils';

interface ProgressStatsProps {
  logs: DailyLog[];
  className?: string;
}

export function ProgressStats({ logs, className }: ProgressStatsProps) {
  const stats = computeProgressStats(logs);

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        label="Days logged"
        value={String(stats.daysLogged)}
        sub={stats.daysLogged > 0 ? 'in selected range' : undefined}
      />
      <StatCard
        label="Weight change"
        value={
          stats.weightChange != null
            ? `${stats.weightChange >= 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg`
            : '—'
        }
        sub={
          stats.firstWeight != null && stats.lastWeight != null
            ? `${formatNumber(stats.firstWeight)} → ${formatNumber(stats.lastWeight)}`
            : undefined
        }
        trend={stats.weightChange}
      />
      <StatCard
        label="Avg steps"
        value={stats.avgSteps != null ? formatNumber(stats.avgSteps, 0) : '—'}
      />
      <StatCard
        label="Avg calories"
        value={stats.avgCalories != null ? formatNumber(stats.avgCalories, 0) : '—'}
        sub="kcal logged"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number | null;
}) {
  const trendColor =
    trend == null
      ? ''
      : trend < 0
        ? 'text-green-600'
        : trend > 0
          ? 'text-orange-600'
          : 'text-muted-foreground';

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn('text-2xl font-semibold tabular-nums', trendColor)}>{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
