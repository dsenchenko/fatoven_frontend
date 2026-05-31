import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage, RegisterPage } from '@/features/auth/AuthPages';
import { HistoryPage } from '@/features/history/HistoryPage';
import { SharedStatsPage } from '@/features/history/SharedStatsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path=":username/stats" element={<SharedStatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
