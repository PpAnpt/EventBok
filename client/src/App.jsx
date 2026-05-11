import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ConcertList from "./pages/concerts/ConcertList.jsx";
import Seatings from "./pages/seatings/Seatings.jsx";
import BookingList from "./pages/booking/BookingList.jsx";
import PaymentList from "./pages/payments/PaymentList.jsx";
import Report from "./pages/report/Report.jsx";
import Settings from "./pages/settings/Settings.jsx";

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="concerts" element={<ConcertList />} />
        <Route path="seatings" element={<Seatings />} />
        <Route path="booking" element={<BookingList />} />
        <Route path="payments" element={<PaymentList />} />
        <Route path="report" element={<Report />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
