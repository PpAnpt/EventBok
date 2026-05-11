import { useState, useEffect } from "react";
import { organizerPortalApi } from "../../api/index.js";

const statusColor = { upcoming: { bg: "#e0e7ff", color: "#4338ca" }, ongoing: { bg: "#fef9c3", color: "#a16207" }, completed: { bg: "#dcfce7", color: "#16a34a" }, cancelled: { bg: "#fee2e2", color: "#dc2626" } };

function DetailModal({ concert, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 500, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>{concert.concert_name}</h3>
        {[
          ["Artist", concert.artist_name],
          ["Venue", concert.venue_name],
          ["Location", concert.location],
          ["Status", concert.status],
          ["Description", concert.description || "-"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
            <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{value}</span>
          </div>
        ))}
        {concert.sessions?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>Sessions ({concert.sessions.length})</p>
            {concert.sessions.map((s, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: "#7c3aed" }}>{s.session_name}</span>
                <span style={{ color: "#6b7280", marginLeft: 10 }}>{s.show_date} · {s.start_time} – {s.end_time}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerConcerts() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    organizerPortalApi.myConcerts()
      .then((r) => setConcerts(r.data || []))
      .catch(() => setConcerts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {viewing && <DetailModal concert={viewing} onClose={() => setViewing(null)} />}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>My Concerts</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Your concerts (read-only)</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading...</div>
        ) : concerts.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No concerts yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Concert", "Artist", "Venue", "Sessions", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {concerts.map((c) => (
                <tr key={c.concert_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.concert_name}</div>
                    {c.cover_url && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Has cover image</div>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{c.artist_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.venue_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.sessions?.length || 0} sessions</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, ...statusColor[c.status] }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => setViewing(c)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#6b7280", fontWeight: 600 }} title="View">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
