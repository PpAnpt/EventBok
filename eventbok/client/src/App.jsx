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
import VenueList from "./pages/venues/VenueList.jsx";
import OrganizerList from "./pages/organizers/OrganizerList.jsx";
import OrganizerLogin from "./pages/organizer-portal/OrganizerLogin.jsx";
import OrganizerLayout from "./pages/organizer-portal/OrganizerLayout.jsx";
import OrganizerDashboard from "./pages/organizer-portal/OrganizerDashboard.jsx";
import OrganizerConcerts from "./pages/organizer-portal/OrganizerConcerts.jsx";
import OrganizerBookings from "./pages/organizer-portal/OrganizerBookings.jsx";
import UserLayout from "./pages/user/UserLayout.jsx";
import ConcertBrowse from "./pages/user/ConcertBrowse.jsx";
import ConcertDetail from "./pages/user/ConcertDetail.jsx";
import UserLogin from "./pages/user/UserLogin.jsx";
import MyBookings from "./pages/user/MyBookings.jsx";

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Organizer Portal */}
      <Route path="/organizer/login" element={<OrganizerLogin />} />
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="concerts" element={<OrganizerConcerts />} />
        <Route path="bookings" element={<OrganizerBookings />} />
      </Route>

      {/* Public user-facing routes */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<ConcertBrowse />} />
        <Route path="concert/:id" element={<ConcertDetail />} />
        <Route path="login" element={<UserLogin />} />
        <Route path="my-bookings" element={<MyBookings />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes */}
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
        <Route path="venues" element={<VenueList />} />
        <Route path="organizers" element={<OrganizerList />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
