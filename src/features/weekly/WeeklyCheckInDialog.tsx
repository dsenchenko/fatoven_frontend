import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSharedWeeklyAssessment, getWeeklyAssessment, upsertWeeklyAssessment } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { WeeklyCheckInForm } from '@/features/weekly/WeeklyCheckInForm';
import {
  assessmentToWeeklyCheckInForm,
  emptyWeeklyCheckInForm,
  hasWeeklyCheckInData,
} from '@/features/weekly/weekly-check-in-utils';
import { formatDisplayDate } from '@/lib/dates';
import { parseOptionalNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button, Dialog } from '@/components/ui';

interface WeeklyCheckInDialogProps {
  weekStartDate: string;
  weekNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statsUsername?: string;
  readOnly?: boolean;
}

export function WeeklyCheckInDialog({
  weekStartDate,
  weekNumber,
  open,
  onOpenChange,
  statsUsername,
  readOnly = false,
}: WeeklyCheckInDialogProps) {
  const queryClient = useQueryClient();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['weekly-assessment', statsUsername ?? 'me', weekStartDate],
    queryFn: () =>
      statsUsername
        ? getSharedWeeklyAssessment(statsUsername, weekStartDate)
        : getWeeklyAssessment(weekStartDate),
    enabled: open,
    retry: (_, err) => !(err instanceof ApiError && err.status === 404),
  });

  const formDefaults = useMemo(() => {
    if (data?.assessment) return assessmentToWeeklyCheckInForm(data.assessment);
    return emptyWeeklyCheckInForm(weekStartDate);
  }, [data?.assessment, weekStartDate]);

  const formKey = `${weekStartDate}-${data?.assessment?.id ?? 'empty'}-${isLoading ? 'loading' : 'ready'}`;

  const mutation = useMutation({
    mutationFn: upsertWeeklyAssessment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['weekly-assessment', 'me', weekStartDate] });
      void queryClient.invalidateQueries({ queryKey: ['weekly-assessments'] });
      setSaveMessage('Weekly check-in saved');
      setTimeout(() => setSaveMessage(null), 3000);
    },
  });

  const handleSubmit = (form: ReturnType<typeof emptyWeeklyCheckInForm>) => {
    if (readOnly) return;
    mutation.mutate({
      weekStartDate,
      weekNumber,
      restingPulseBpm: parseOptionalNumber(form.restingPulseBpm ?? ''),
      bellyCm: parseOptionalNumber(form.bellyCm ?? ''),
      neckCm: parseOptionalNumber(form.neckCm ?? ''),
      chestCm: parseOptionalNumber(form.chestCm ?? ''),
      satietyScore: parseOptionalNumber(form.satietyScore ?? ''),
      calorieTrackingScore: parseOptionalNumber(form.calorieTrackingScore ?? ''),
      sleepScore: parseOptionalNumber(form.sleepScore ?? ''),
      wellbeingScore: parseOptionalNumber(form.wellbeingScore ?? ''),
      stressScore: parseOptionalNumber(form.stressScore ?? ''),
      notes: form.notes?.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Week ${weekNumber} check-in`}
      description={formatDisplayDate(weekStartDate)}
    >
      <WeeklyCheckInForm
        key={formKey}
        defaultValues={formDefaults}
        isLoading={isLoading || isFetching}
        isSaving={mutation.isPending}
        error={mutation.error}
        saveMessage={saveMessage}
        readOnly={readOnly}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
}

interface WeeklyCheckInButtonProps {
  weekStartDate: string;
  weekNumber: number;
  hasExistingCheckIn?: boolean;
  className?: string;
  statsUsername?: string;
  readOnly?: boolean;
}

export function WeeklyCheckInButton({
  weekStartDate,
  weekNumber,
  hasExistingCheckIn = false,
  className,
  statsUsername,
  readOnly = false,
}: WeeklyCheckInButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn('h-8 shrink-0 gap-2 px-3 text-xs', className)}
        onClick={() => setOpen(true)}
      >
        {readOnly
          ? hasExistingCheckIn
            ? 'View check-in'
            : 'No check-in'
          : hasExistingCheckIn
            ? 'Edit check-in'
            : 'Weekly check-in'}
        {hasExistingCheckIn && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
        )}
      </Button>
      <WeeklyCheckInDialog
        weekStartDate={weekStartDate}
        weekNumber={weekNumber}
        open={open}
        onOpenChange={setOpen}
        statsUsername={statsUsername}
        readOnly={readOnly}
      />
    </>
  );
}

export { hasWeeklyCheckInData };
