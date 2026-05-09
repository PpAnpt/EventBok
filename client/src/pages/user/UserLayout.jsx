import { Outlet, Link, useNavigate } from "react-router-dom";
import { CustomerAuthProvider, useCustomerAuth } from "../../utils/CustomerAuthContext.jsx";

function Header() {
  const { customer, logout, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/user"); };

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/user" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>♪</div>
          <span style={{ fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg,#7c3aed,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EventBok</span>
        </Link>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link to="/user" style={{ color: "#4b5563", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Concerts</Link>
          {isLoggedIn ? (
            <>
              <Link to="/user/my-bookings" style={{ color: "#7c3aed", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>My Tickets</Link>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  {customer.firstname?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{customer.firstname}</span>
                <button onClick={handleLogout} style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 12, cursor: "pointer", color: "#6b7280" }}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/user/login" style={{ color: "#7c3aed", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Login</Link>
              <Link to="/login" style={{ padding: "7px 18px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Admin</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function UserLayout() {
  return (
    <CustomerAuthProvider>
      <div style={{ minHeight: "100vh", background: "#f8f7ff", fontFamily: "Inter, sans-serif" }}>
        <Header />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          <Outlet />
        </main>
        <footer style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 13, borderTop: "1px solid #e5e7eb", marginTop: 40 }}>
          © 2026 EventBok · Concert Ticket Booking System
        </footer>
      </div>
    </CustomerAuthProvider>
  );
}
