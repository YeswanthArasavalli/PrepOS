import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell          from "./components/layout/AppShell";
import LoginPage         from "./pages/auth/LoginPage";
import SignupPage        from "./pages/auth/SignupPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardPage     from "./pages/dashboard/DashboardPage";
import HealthPage        from "./pages/health/HealthPage";
import StudyPage         from "./pages/study/StudyPage";
import MocksPage         from "./pages/mocks/MocksPage";
import AnalyticsPage     from "./pages/analytics/AnalyticsPage";
import JADPage           from "./pages/jad/JADPage";
import SettingsPage      from "./pages/settings/SettingsPage";
import PlannerPage       from "./pages/planner/PlannerPage";
import ResourcesPage     from "./pages/resources/ResourcesPage";
import WeeklyPage        from "./pages/weekly/WeeklyPage";
import CalendarPage      from "./pages/calendar/CalendarPage";
import TimetablePage     from "./pages/timetable/TimetablePage";
import CGLPage           from "./pages/cgl/CGLPage";
import NTPCPage          from "./pages/ntpc/NTPCPage";
import SetupPage         from "./pages/setup/SetupPage";
import DailyLogPage      from "./pages/daily-log/DailyLogPage";

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading PrepOS V1.1...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/signup"         element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/setup"          element={<SetupPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index              element={<DashboardPage />} />
        <Route path="health"      element={<HealthPage />} />
        <Route path="study"       element={<StudyPage />} />
        <Route path="mocks"       element={<MocksPage />} />
        <Route path="analytics"   element={<AnalyticsPage />} />
        <Route path="jad"         element={<JADPage />} />
        <Route path="cgl"         element={<CGLPage />} />
        <Route path="ntpc"        element={<NTPCPage />} />
        <Route path="planner"     element={<PlannerPage />} />
        <Route path="resources"   element={<ResourcesPage />} />
        <Route path="weekly"      element={<WeeklyPage />} />
        <Route path="calendar"    element={<CalendarPage />} />
        <Route path="timetable"   element={<TimetablePage />} />
        <Route path="daily-log"   element={<DailyLogPage />} />
        <Route path="settings"    element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
