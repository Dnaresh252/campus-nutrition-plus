import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Auth/Login";
import FeedbackForm from "./pages/FeedbackForm";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackForm />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/feedback" element={<FeedbackForm />} /> */}

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/feedback" replace />} />

          {/* 404 - redirect to feedback (which will redirect to login if needed) */}
          <Route path="*" element={<Navigate to="/feedback" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
