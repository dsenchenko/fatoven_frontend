import { DailyLogEditor } from '@/features/daily-log/DailyLogEditor';
import { todayString } from '@/lib/dates';

export function DailyLogPage() {
  return <DailyLogEditor initialDate={todayString()} />;
}
