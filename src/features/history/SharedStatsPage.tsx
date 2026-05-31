import { Navigate, useParams } from 'react-router-dom';
import { SharedStatsView } from '@/features/history/HistoryPage';

export function SharedStatsPage() {
  const { username = '' } = useParams();

  if (!username) {
    return <Navigate to="/" replace />;
  }

  return <SharedStatsView username={username} />;
}
