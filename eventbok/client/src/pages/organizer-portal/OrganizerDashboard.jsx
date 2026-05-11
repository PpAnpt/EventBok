import { useState, useEffect } from "react";
import { organizerPortalApi } from "../../api/index.js";
import { useOrganizerAuth } from "../../utils/OrganizerAuthContext.jsx";

const statusColor = { upcoming: { bg: "#e0e7ff", color: "#4338ca" }, ongoing: { bg: "#fef9c3", color: "#a16207" }, completed: { bg: "#dcfce7", color: "#16a34a" }, cancelled: { bg: "#fee2e2", color: "#dc2626" } };

export default function OrganizerDashboard() {
  const { organizer } = useOrganizerAuth();
  const [stats, setStats] = useState(null);
  const [concerts, setConcerts] = useState([]);

  useEffect(() => {
    organizerPortalApi.myStats().then((r) => setStats(r.data)).catch(() => {});
    organizerPortalApi.myConcerts().then((r) => setConcerts((r.data || []).slice(0, 4))).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Concerts", value: stats?.total_concerts ?? "-", icon: "C", color: "#7c3aed", bg: "#f3f0ff" },
    { label: "Confirmed Bookings", value: stats?.confirmed_bookings ?? "-", icon: "B", color: "#ec4899", bg: "#fdf2f8" },
    { label: "Revenue (completed)", value: stats ? `$${Number(stats.total_revenue).toLocaleString()}` : "-", icon: "$", color: "#10b981", bg: "#ecfdf5" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Overview</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Hello, {organizer?.organizer_name}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 16, padding: 20, borderTop: `3px solid ${c.color}`, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 6px" }}>{c.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{c.value}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent concerts */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Recent Concerts</h2>
        {concerts.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: 20 }}>No concerts yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {concerts.map((c) => (
              <div key={c.concert_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f9fafb", borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.concert_name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{c.artist_name} · {c.venue_name}</div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, ...statusColor[c.status] }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
