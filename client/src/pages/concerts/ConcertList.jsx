import { useState, useEffect } from "react";
import { concertsApi } from "../../api/index.js";

const mockConcerts = [
  { concert_id: "C001", concert_name: "Rock Night 2026", genre: "Rock", organizer_name: "The Rockers Ent.", venue_name: "Grand Arena", status: "upcoming",
    sessions: [{ session_name: "Night 1", show_date: "2026-04-15", start_time: "19:00" }, { session_name: "Night 2", show_date: "2026-04-16", start_time: "19:00" }] },
  { concert_id: "C002", concert_name: "Jazz Evening", genre: "Jazz", organizer_name: "Smooth Quartet Co.", venue_name: "Blue Note Hall", status: "upcoming",
    sessions: [{ session_name: "Opening Night", show_date: "2026-04-20", start_time: "20:00" }] },
  { concert_id: "C003", concert_name: "Pop Fest", genre: "Pop", organizer_name: "StarStage Productions", venue_name: "City Stadium", status: "upcoming",
    sessions: [{ session_name: "Day 1 - AM", show_date: "2026-05-01", start_time: "18:00" }, { session_name: "Day 1 - PM", show_date: "2026-05-01", start_time: "21:00" }, { session_name: "Day 2", show_date: "2026-05-02", start_time: "18:00" }] },
  { concert_id: "C004", concert_name: "Classical Symphony", genre: "Classical", organizer_name: "National Orchestra", venue_name: "Concert Hall", status: "completed",
    sessions: [{ session_name: "Gala Night", show_date: "2026-03-10", start_time: "19:30" }] },
];

const statusColor = { upcoming: { bg: "#e0e7ff", color: "#4338ca" }, completed: { bg: "#dcfce7", color: "#16a34a" }, cancelled: { bg: "#fee2e2", color: "#dc2626" }, ongoing: { bg: "#fef9c3", color: "#a16207" } };
const genreColor = { Rock: "#f3f0ff", Jazz: "#fdf2f8", Pop: "#fce7f3", Classical: "#ecfdf5" };

export default function ConcertList() {
  const [concerts, setConcerts] = useState(mockConcerts);
  const [search, setSearch] = useState("");

  const filtered = concerts.filter((c) =>
    c.concert_name.toLowerCase().includes(search.toLowerCase()) ||
    c.organizer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.venue_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Concerts</h1>
          <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin 🔑</p>
        </div>
        <button style={{
          padding: "10px 18px", borderRadius: 12, border: "none",
          background: "var(--gradient-brand)", color: "#fff",
          fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
        }}>+ Add Concert</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ec4899" }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>All Concerts</span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 16px 18px" }}>View and manage concert listings</p>
          <input
            placeholder="Search concerts, organizers, or venues..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)",
              fontSize: 13, width: 340, outline: "none"
            }}
          />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["ID", "Concert Name", "Organizer", "Sessions", "Venue", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.concert_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>{c.concert_id}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: genreColor[c.genre] || "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>♪</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.concert_name}</div>
                      <span style={{ fontSize: 11, background: genreColor[c.genre] || "#f3f0ff", padding: "2px 8px", borderRadius: 20, color: "#6b7280" }}>{c.genre}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13 }}>{c.organizer_name}</td>
                <td style={{ padding: "14px 16px" }}>
                  {c.sessions.map((s) => (
                    <div key={s.session_name} style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                        {s.session_name} · {new Date(s.show_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})} {s.start_time}
                      </span>
                    </div>
                  ))}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13 }}>
                  <div>📍 {c.venue_name}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    ...(statusColor[c.status] || { bg: "#f3f4f6", color: "#6b7280" }),
                    background: statusColor[c.status]?.bg
                  }}>{c.status}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["👁", "ℹ", "✏", "🗑"].map((icon, i) => (
                      <button key={i} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "4px", borderRadius: 6 }}>{icon}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
