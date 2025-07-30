import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { AuthProvider } from "./contexts";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/sonner";

// Auth components
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/LandingPage";

// User components
import UserDashboard from "./pages/user/Dashboard";
import InstrumentList from "./pages/user/InstrumentList";
import InstrumentDetail from "./pages/user/InstrumentDetail";
import UserProfile from "./pages/user/Profile";

// Admin components
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInstruments from "./pages/admin/Instruments";
import AdminUsers from "./pages/admin/Users";
import AdminUsageHistory from "./pages/admin/UsageHistory";

// Shared components
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";

// Redirect component for instrument detail
const RedirectToInstrument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log("RedirectToInstrument - ID from useParams:", id);
  console.log(
    "RedirectToInstrument - Current pathname:",
    window.location.pathname
  );
  return <Navigate to={`/app/instruments/${id}`} replace />;
};

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing page */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={isAdmin ? "/admin/dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* User routes */}
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="instruments" element={<InstrumentList />} />
        <Route path="instruments/:id" element={<InstrumentDetail />} />
        <Route path="profile" element={<UserProfile />} />

        {/* Admin routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/instruments"
          element={
            <ProtectedRoute adminOnly>
              <AdminInstruments />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/usage"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsageHistory />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Legacy redirects for backward compatibility */}
      <Route
        path="/dashboard"
        element={<Navigate to="/app/dashboard" replace />}
      />
      <Route
        path="/instruments"
        element={<Navigate to="/app/instruments" replace />}
      />
      <Route path="/instruments/:id" element={<RedirectToInstrument />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route
        path="/admin/dashboard"
        element={<Navigate to="/app/admin/dashboard" replace />}
      />
      <Route
        path="/admin/instruments"
        element={<Navigate to="/app/admin/instruments" replace />}
      />
      <Route
        path="/admin/users"
        element={<Navigate to="/app/admin/users" replace />}
      />
      <Route
        path="/admin/usage"
        element={<Navigate to="/app/admin/usage" replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
