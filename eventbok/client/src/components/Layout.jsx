import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const navItems = [
  { path: "/dashboard", label: "Dashboard",  icon: "⊞" },
  { path: "/concerts",  label: "Concerts",   icon: "♪" },
  { path: "/seatings",  label: "Seatings",   icon: "▦" },
  { path: "/booking",   label: "Booking",    icon: "◫" },
  { path: "/payments",  label: "Payments",   icon: "▬" },
  { path: "/report",    label: "Report",     icon: "▤" },
  { path: "/settings",  label: "Settings",   icon: "⚙" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: "#fff", borderRight: "1px solid var(--color-border)",
        display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0,
        boxShadow: "2px 0 8px rgba(124,58,237,0.06)"
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #fde68a 0%, #f9a8d4 100%)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
            }}>🐻</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-primary)" }}>EventBok</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Management Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, marginBottom: 2,
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
              background: isActive ? "rgba(124,58,237,0.08)" : "transparent",
              transition: "all 0.15s",
            })}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 13
            }}>
              {user?.name?.[0] ?? "A"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name ?? "Admin User"}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "6px", borderRadius: 8, border: "none",
            background: "transparent", color: "var(--color-text-muted)",
            fontSize: 13, cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 6
          }}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          height: 56, background: "#fff", borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 24px", gap: 12, flexShrink: 0
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(34,197,94,0.1)", color: "#16a34a",
            padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            Live
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #fde68a 0%, #f9a8d4 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
          }}>🐻</div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
