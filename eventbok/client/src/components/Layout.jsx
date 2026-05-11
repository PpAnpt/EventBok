import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

function NavIcon({ name }) {
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "dashboard")   return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === "concerts")    return <svg {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
  if (name === "seatings")    return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
  if (name === "booking")     return <svg {...s}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>;
  if (name === "payments")    return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
  if (name === "report")      return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (name === "venues")      return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (name === "organizers")  return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (name === "settings")    return <svg {...s}><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
  return null;
}

const navItems = [
  { path: "/dashboard",   label: "Dashboard",   icon: "dashboard" },
  { path: "/concerts",    label: "Concerts",    icon: "concerts" },
  { path: "/seatings",    label: "Seatings",    icon: "seatings" },
  { path: "/booking",     label: "Booking",     icon: "booking" },
  { path: "/payments",    label: "Payments",    icon: "payments" },
  { path: "/report",      label: "Report",      icon: "report" },
  { divider: true },
  { path: "/venues",      label: "Venues",      icon: "venues" },
  { path: "/organizers",  label: "Organizers",  icon: "organizers" },
  { divider: true },
  { path: "/settings",    label: "Settings",    icon: "settings" },
];

const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const UserIcon = ({ size = 16, stroke = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function Layout() {
  const { logout } = useAuth();
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
              background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><LogoIcon /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-primary)" }}>EventBok</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Management Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {navItems.map((item, i) =>
            item.divider ? (
              <div key={i} style={{ height: 1, background: "var(--color-border)", margin: "6px 4px" }} />
            ) : (
              <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                background: isActive ? "rgba(124,58,237,0.08)" : "transparent",
                transition: "all 0.15s",
              })}>
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UserIcon size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Admin User</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "6px", borderRadius: 8, border: "none",
            background: "transparent", color: "var(--color-text-muted)",
            fontSize: 13, cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 6
          }}>
            Logout
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
            background: "var(--gradient-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <UserIcon size={16} />
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
