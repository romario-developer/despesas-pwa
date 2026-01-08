import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ApiHealthCheck from "../components/ApiHealthCheck";
import AppLayout from "../components/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";

const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const EntriesPage = lazy(() => import("../pages/EntriesPage"));
const EntryCreatePage = lazy(() => import("../pages/EntryCreatePage"));
const EntryEditPage = lazy(() => import("../pages/EntryEditPage"));
const PlanningPage = lazy(() => import("../pages/PlanningPage"));
const ChangePasswordPage = lazy(() => import("../pages/ChangePasswordPage"));

const AppRouter = () => (
  <BrowserRouter>
<<<<<<< HEAD
    <ApiHealthCheck />
    <Suspense fallback={<div className="p-6">Carregando.</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/entries/new" element={<EntryCreatePage />} />
          <Route path="/entries/:id/edit" element={<EntryEditPage />} />
          <Route path="/planning" element={<PlanningPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
=======
    <AuthProvider>
      <ApiHealthCheck />
      <Suspense fallback={<div className="p-6">Carregando.</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/entries" element={<EntriesPage />} />
            <Route path="/entries/new" element={<EntryCreatePage />} />
            <Route path="/entries/:id/edit" element={<EntryEditPage />} />
            <Route path="/planning" element={<PlanningPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
>>>>>>> 379f1e03b89eb5f8e29aaf5abc851d46bda4215d
  </BrowserRouter>
);

export default AppRouter;
