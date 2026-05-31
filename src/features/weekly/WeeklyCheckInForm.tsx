import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { Alert, Button, Input, Label } from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import {
  type WeeklyCheckInForm as WeeklyCheckInFormValues,
  weeklyCheckInSchema,
} from '@/features/weekly/weekly-check-in-utils';

interface WeeklyCheckInFormProps {
  defaultValues: WeeklyCheckInFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: unknown;
  saveMessage?: string | null;
  readOnly?: boolean;
  onSubmit: (values: WeeklyCheckInFormValues) => void;
}

export function WeeklyCheckInForm({
  defaultValues,
  isLoading,
  isSaving,
  error,
  saveMessage,
  readOnly = false,
  onSubmit,
}: WeeklyCheckInFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeeklyCheckInFormValues>({
    resolver: zodResolver(weeklyCheckInSchema),
    defaultValues,
  });

  return (
    <>
      {isLoading && (
        <div className="mb-4 flex justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <ApiErrorAlert error={error} />
        </Alert>
      )}
      {saveMessage && <Alert className="mb-4">{saveMessage}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Measurements
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Resting pulse (bpm)" error={errors.restingPulseBpm?.message}>
              <Input inputMode="numeric" readOnly={readOnly} {...register('restingPulseBpm')} />
            </Field>
            <Field label="Belly (cm)" error={errors.bellyCm?.message}>
              <Input inputMode="decimal" readOnly={readOnly} {...register('bellyCm')} />
            </Field>
            <Field label="Neck (cm)" error={errors.neckCm?.message}>
              <Input inputMode="decimal" readOnly={readOnly} {...register('neckCm')} />
            </Field>
            <Field label="Chest (cm)" error={errors.chestCm?.message}>
              <Input inputMode="decimal" readOnly={readOnly} {...register('chestCm')} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Subjective scores (1–10)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreField
              label="Satiety"
              name="satietyScore"
              register={register}
              error={errors.satietyScore?.message}
              readOnly={readOnly}
            />
            <ScoreField
              label="Calorie tracking accuracy"
              name="calorieTrackingScore"
              register={register}
              error={errors.calorieTrackingScore?.message}
              readOnly={readOnly}
            />
            <ScoreField
              label="Sleep"
              name="sleepScore"
              register={register}
              error={errors.sleepScore?.message}
              readOnly={readOnly}
            />
            <ScoreField
              label="Wellbeing"
              name="wellbeingScore"
              register={register}
              error={errors.wellbeingScore?.message}
              readOnly={readOnly}
            />
            <ScoreField
              label="Stress"
              name="stressScore"
              register={register}
              error={errors.stressScore?.message}
              readOnly={readOnly}
            />
          </div>
        </section>

        <Field label="Notes" error={errors.notes?.message}>
          <textarea
            rows={3}
            readOnly={readOnly}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('notes')}
          />
        </Field>

        {!readOnly && (
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading || isSubmitting || isSaving}>
              {isSaving ? 'Saving…' : 'Save check-in'}
            </Button>
          </div>
        )}
      </form>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ScoreField({
  label,
  name,
  register,
  error,
  readOnly = false,
}: {
  label: string;
  name: keyof WeeklyCheckInFormValues;
  register: ReturnType<typeof useForm<WeeklyCheckInFormValues>>['register'];
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="range" min={1} max={10} step={1} readOnly={readOnly} {...register(name)} className="h-2 p-0" />
      <Input type="number" min={1} max={10} readOnly={readOnly} {...register(name)} className="w-20" />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
