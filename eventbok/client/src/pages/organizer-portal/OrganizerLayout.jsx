import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { OrganizerAuthProvider, useOrganizerAuth } from "../../utils/OrganizerAuthContext.jsx";

function NavIcon({ name }) {
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "overview")   return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === "concerts")   return <svg {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
  if (name === "bookings")   return <svg {...s}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>;
  return null;
}

const navItems = [
  { path: "/organizer/dashboard", label: "Overview",    icon: "overview" },
  { path: "/organizer/concerts",  label: "My Concerts", icon: "concerts" },
  { path: "/organizer/bookings",  label: "Bookings",    icon: "bookings" },
];

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

function Sidebar() {
  const { organizer, logout } = useOrganizerAuth();
  const navigate = useNavigate();

  return (
    <aside style={{ width: 230, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0, boxShadow: "2px 0 8px rgba(124,58,237,0.06)" }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogoIcon />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#7c3aed" }}>Organizer Portal</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>EventBok</div>
          </div>
        </div>
        {organizer && (
          <div style={{ background: "#f3f0ff", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{organizer.organizer_name}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{organizer.contact_email}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px" }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, marginBottom: 2,
            textDecoration: "none", fontSize: 14, fontWeight: 500,
            color: isActive ? "#7c3aed" : "#6b7280",
            background: isActive ? "rgba(124,58,237,0.08)" : "transparent",
            transition: "all 0.15s",
          })}>
            <NavIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb" }}>
        <button onClick={() => { logout(); navigate("/organizer/login"); }}
          style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          Logout
        </button>
      </div>
    </aside>
  );
}

function OrganizerLayoutInner() {
  const { isLoggedIn } = useOrganizerAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate("/organizer/login");
    return null;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f7ff" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function OrganizerLayout() {
  return (
    <OrganizerAuthProvider>
      <OrganizerLayoutInner />
    </OrganizerAuthProvider>
  );
}
