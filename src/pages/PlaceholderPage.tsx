import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">This feature is planned for a future release.</p>
      </CardContent>
    </Card>
  );
}
