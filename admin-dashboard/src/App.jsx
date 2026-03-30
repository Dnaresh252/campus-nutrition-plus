import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WeeklyMenu from "./pages/WeeklyMenu";
import DailyOverride from "./pages/DailyOverride";
import LiveFeedback from "./pages/LiveFeedback";
import "./index.css";

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/weekly-menu"
            element={
              <ProtectedRoute>
                <WeeklyMenu />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/daily-override"
            element={
              <ProtectedRoute>
                <DailyOverride />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/live-feedback"
            element={
              <ProtectedRoute>
                <LiveFeedback />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
