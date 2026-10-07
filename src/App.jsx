import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NewPrescription from "./pages/NewPrescription";
import PrescriptionHistory from "./pages/PrescriptionHistory";
import PrescriptionHistoryView from "./pages/PrescriptionHistoryView";
import Templates from "./pages/Templates";
import CreateTemplate from "./pages/CreateTemplate";
import MedicineLibrary from "./pages/MedicineLibrary";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C2DFE3] border-t-[#6C9A8B]" />

          <p className="text-sm font-semibold text-[#33463F]">
            Loading RxFlow...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C2DFE3] border-t-[#6C9A8B]" />

          <p className="text-sm font-semibold text-[#33463F]">
            Loading RxFlow...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* LANDING */}
      <Route path="/" element={<Landing />} />

      {/* PUBLIC AUTH PAGES */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />

      {/* PROTECTED PAGES */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/new-prescription"
        element={
          <ProtectedRoute>
            <NewPrescription />
          </ProtectedRoute>
        }
      />

      <Route
        path="/prescription-history"
        element={
          <ProtectedRoute>
            <PrescriptionHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/prescription-history/view"
        element={
          <ProtectedRoute>
            <PrescriptionHistoryView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-template"
        element={
          <ProtectedRoute>
            <CreateTemplate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicines"
        element={
          <ProtectedRoute>
            <MedicineLibrary />
          </ProtectedRoute>
        }
      />

      {/* UNKNOWN ROUTES */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;