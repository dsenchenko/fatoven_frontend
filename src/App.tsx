import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage, RegisterPage } from '@/features/auth/AuthPages';
import { DailyLogPage } from '@/pages/DailyLogPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SharedStatsPage } from '@/pages/SharedStatsPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

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
          <Route path="history" element={<Navigate to="/" replace />} />
          <Route path="daily" element={<DailyLogPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="progress" element={<Navigate to="/" replace />} />
          <Route path="weekly" element={<Navigate to="/" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path=":username/stats" element={<SharedStatsPage />} />
          <Route
            path="food"
            element={
              <PlaceholderPage
                title="Food Catalog"
                description="Search and log foods from a nutrition database."
              />
            }
          />
          <Route
            path="garmin"
            element={
              <PlaceholderPage
                title="Garmin Sync"
                description="Connect your Garmin account to import activity data."
              />
            }
          />
          <Route
            path="coach"
            element={
              <PlaceholderPage
                title="AI Coach"
                description="Personalized coaching based on your tracking data."
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
