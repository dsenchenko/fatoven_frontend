import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  emptyMessage?: string;
  hasData: boolean;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  emptyMessage = 'Not enough data yet.',
  hasData,
  height = 280,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div style={{ height }} className="w-full">
            {children}
          </div>
        ) : (
          <div
            style={{ height }}
            className="flex items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground"
          >
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    fontSize: '12px',
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

export const chartAxisStyle = {
  fontSize: 11,
  fill: 'hsl(var(--muted-foreground))',
};

export const chartGridStyle = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
};
