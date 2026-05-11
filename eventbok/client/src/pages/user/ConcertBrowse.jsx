import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api/index.js";

const statusColor = {
  upcoming: { bg: "#e0e7ff", color: "#4338ca" },
  ongoing:  { bg: "#fef9c3", color: "#a16207" },
  completed:{ bg: "#dcfce7", color: "#16a34a" },
  cancelled:{ bg: "#fee2e2", color: "#dc2626" },
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80";

export default function ConcertBrowse() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    publicApi.getConcerts({ status: "upcoming" })
      .then((r) => setConcerts(r.data || []))
      .catch(() => setConcerts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = concerts.filter((c) =>
    !search ||
    c.concert_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.venue_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg,#7c3aed,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Discover Concerts
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16, margin: "0 0 24px" }}>Book your seats for the hottest shows in town</p>
        <input
          placeholder="Search by concert, artist, or venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 500, padding: "12px 20px", borderRadius: 30, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#9ca3af", padding: 60, fontSize: 15 }}>Loading concerts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#9ca3af", padding: 60, fontSize: 15 }}>No concerts found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {filtered.map((c) => (
            <ConcertCard key={c.concert_id} concert={c} onClick={() => navigate(`/user/concert/${c.concert_id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConcertCard({ concert: c, onClick }) {
  const firstSession = c.sessions?.[0];
  return (
    <div
      onClick={onClick}
      style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
    >
      {/* Cover image */}
      <div style={{ aspectRatio: "210/297", overflow: "hidden", position: "relative" }}>
        <img
          src={c.cover_url || PLACEHOLDER}
          alt={c.concert_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusColor[c.status]?.bg || "#f3f4f6", color: statusColor[c.status]?.color || "#374151" }}>
            {c.status}
          </span>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "18px 20px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>{c.concert_name}</h3>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>{c.artist_name}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#6b7280" }}>
          <span>{c.venue_name}</span>
          {firstSession && <span>{firstSession.show_date} · {firstSession.start_time}</span>}
          {(c.sessions?.length || 0) > 1 && <span style={{ color: "#a78bfa", fontWeight: 600 }}>+{c.sessions.length - 1} more session{c.sessions.length > 2 ? "s" : ""}</span>}
        </div>
        <button
          style={{ marginTop: 14, width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          View & Book Tickets
        </button>
      </div>
    </div>
  );
}
