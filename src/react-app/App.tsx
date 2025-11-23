import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import RoleSelectionPage from "@/react-app/pages/RoleSelection";
import RiderDashboardPage from "@/react-app/pages/RiderDashboard";
import DriverDashboardPage from "@/react-app/pages/DriverDashboard";
import RideDetailPage from "@/react-app/pages/RideDetail";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/rider" element={<RiderDashboardPage />} />
          <Route path="/driver" element={<DriverDashboardPage />} />
          <Route path="/rides/:id" element={<RideDetailPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
