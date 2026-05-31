import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getDailyLog, upsertDailyLog } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { formatDisplayDate } from '@/lib/dates';
import { parseOptionalNumber } from '@/lib/utils';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';

const dailyLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.string().optional(),
  steps: z.string().optional(),
  caloriesKcal: z.string().optional(),
  fatGrams: z.string().optional(),
  carbsGrams: z.string().optional(),
  proteinGrams: z.string().optional(),
  garminCaloriesKcal: z.string().optional(),
  notes: z.string().optional(),
});

type DailyLogForm = z.infer<typeof dailyLogSchema>;

function logToForm(log: {
  logDate: string;
  weightKg: number | null;
  steps: number | null;
  caloriesKcal: number | null;
  fatGrams: number | null;
  carbsGrams: number | null;
  proteinGrams: number | null;
  garminCaloriesKcal: number | null;
  notes: string | null;
}): DailyLogForm {
  return {
    logDate: log.logDate,
    weightKg: log.weightKg?.toString() ?? '',
    steps: log.steps?.toString() ?? '',
    caloriesKcal: log.caloriesKcal?.toString() ?? '',
    fatGrams: log.fatGrams?.toString() ?? '',
    carbsGrams: log.carbsGrams?.toString() ?? '',
    proteinGrams: log.proteinGrams?.toString() ?? '',
    garminCaloriesKcal: log.garminCaloriesKcal?.toString() ?? '',
    notes: log.notes ?? '',
  };
}

const emptyForm = (date: string): DailyLogForm => ({
  logDate: date,
  weightKg: '',
  steps: '',
  caloriesKcal: '',
  fatGrams: '',
  carbsGrams: '',
  proteinGrams: '',
  garminCaloriesKcal: '',
  notes: '',
});

interface DailyLogPageProps {
  initialDate: string;
}

export function DailyLogEditor({ initialDate }: DailyLogPageProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DailyLogForm>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: emptyForm(initialDate),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['daily', selectedDate],
    queryFn: () => getDailyLog(selectedDate),
    retry: (_, err) => !(err instanceof ApiError && err.status === 404),
  });

  useEffect(() => {
    if (data?.log) {
      reset(logToForm(data.log));
    } else if (!isLoading && !isFetching) {
      reset(emptyForm(selectedDate));
    }
  }, [data, isLoading, isFetching, reset, selectedDate]);

  const mutation = useMutation({
    mutationFn: upsertDailyLog,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['daily'] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-summaries'] });
      setSaveMessage(`Saved ${result.log.logDate}`);
      setTimeout(() => setSaveMessage(null), 3000);
    },
  });

  const onSubmit = (form: DailyLogForm) => {
    mutation.mutate({
      logDate: form.logDate,
      weightKg: parseOptionalNumber(form.weightKg ?? ''),
      steps: parseOptionalNumber(form.steps ?? ''),
      caloriesKcal: parseOptionalNumber(form.caloriesKcal ?? ''),
      fatGrams: parseOptionalNumber(form.fatGrams ?? ''),
      carbsGrams: parseOptionalNumber(form.carbsGrams ?? ''),
      proteinGrams: parseOptionalNumber(form.proteinGrams ?? ''),
      garminCaloriesKcal: parseOptionalNumber(form.garminCaloriesKcal ?? ''),
      notes: form.notes?.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Log</h1>
          <p className="text-muted-foreground">{formatDisplayDate(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-picker" className="sr-only">
            Date
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {(isLoading || isFetching) && (
            <div className="mb-4 flex justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {mutation.error && (
            <Alert variant="destructive" className="mb-4">
              <ApiErrorAlert error={mutation.error} />
            </Alert>
          )}
          {saveMessage && (
            <Alert className="mb-4">{saveMessage}</Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('logDate')} value={selectedDate} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Weight (kg)" id="weightKg" error={errors.weightKg?.message}>
                <Input id="weightKg" inputMode="decimal" {...register('weightKg')} />
              </Field>
              <Field label="Steps" id="steps" error={errors.steps?.message}>
                <Input id="steps" inputMode="numeric" {...register('steps')} />
              </Field>
              <Field label="Calories (kcal)" id="caloriesKcal" error={errors.caloriesKcal?.message}>
                <Input id="caloriesKcal" inputMode="numeric" {...register('caloriesKcal')} />
              </Field>
              <Field label="Fat (g)" id="fatGrams" error={errors.fatGrams?.message}>
                <Input id="fatGrams" inputMode="numeric" {...register('fatGrams')} />
              </Field>
              <Field label="Carbs (g)" id="carbsGrams" error={errors.carbsGrams?.message}>
                <Input id="carbsGrams" inputMode="numeric" {...register('carbsGrams')} />
              </Field>
              <Field label="Protein (g)" id="proteinGrams" error={errors.proteinGrams?.message}>
                <Input id="proteinGrams" inputMode="numeric" {...register('proteinGrams')} />
              </Field>
              <Field
                label="Garmin calories (kcal)"
                id="garminCaloriesKcal"
                error={errors.garminCaloriesKcal?.message}
              >
                <Input id="garminCaloriesKcal" inputMode="numeric" {...register('garminCaloriesKcal')} />
              </Field>
            </div>

            <Field label="Notes" id="notes" error={errors.notes?.message}>
              <textarea
                id="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('notes')}
              />
            </Field>

            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save log'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
