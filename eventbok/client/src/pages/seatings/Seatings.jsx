import { useState, useEffect } from "react";
import { concertsApi, sessionsApi, seatsApi } from "../../api/index.js";

// Zone color scheme — same logic as ConcertDetail
function getZoneStyle(name = "", type = "regular") {
  const n = name.toLowerCase();
  if (n.includes("platinum"))  return { bg: "#f5f3ff", border: "#7c3aed", text: "#5b21b6", label: "#7c3aed" };
  if (n.includes("gold"))      return { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", label: "#d97706" };
  if (type === "vip")          return { bg: "#f5f3ff", border: "#8b5cf6", text: "#5b21b6", label: "#7c3aed" };
  if (type === "premium")      return { bg: "#fdf2f8", border: "#ec4899", text: "#9d174d", label: "#ec4899" };
  if (n.includes("upper"))     return { bg: "#f8fafc", border: "#94a3b8", text: "#334155", label: "#64748b" };
  return                               { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", label: "#16a34a" };
}

const statusColor = { available: "#22c55e", booked: "#ef4444", reserved: "#f59e0b" };

function groupByZoneAndRow(seats) {
  const zones = {};
  seats.forEach((s) => {
    if (!zones[s.zone_id]) {
      zones[s.zone_id] = { name: s.zone_name, type: s.type, price: s.price, rows: {} };
    }
    const row = s.seat_no.replace(/\d+$/, "");
    if (!zones[s.zone_id].rows[row]) zones[s.zone_id].rows[row] = [];
    zones[s.zone_id].rows[row].push(s);
  });
  Object.values(zones).forEach((zone) => {
    zone.rows = Object.fromEntries(Object.entries(zone.rows).sort(([a], [b]) => a.localeCompare(b)));
    Object.values(zone.rows).forEach((rs) =>
      rs.sort((a, b) => parseInt(a.seat_no.match(/\d+$/)?.[0] || 0) - parseInt(b.seat_no.match(/\d+$/)?.[0] || 0))
    );
  });
  return zones;
}

function SeatDot({ status, title }) {
  return (
    <div title={title}
      style={{ width: 18, height: 16, borderRadius: 4, background: statusColor[status] || "#e5e7eb", cursor: "default", transition: "transform 0.1s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    />
  );
}

export default function Seatings() {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcertId, setSelectedConcertId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    concertsApi.list().then((res) => {
      const list = res.data || [];
      setConcerts(list);
      if (list.length > 0) setSelectedConcertId(list[0].concert_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedConcertId) return;
    sessionsApi.list({ concert_id: selectedConcertId }).then((res) => {
      const list = res.data || [];
      setSessions(list);
      setSelectedSessionId(list.length > 0 ? list[0].session_id : "");
    });
  }, [selectedConcertId]);

  useEffect(() => {
    if (!selectedSessionId) { setSeats([]); return; }
    setLoading(true);
    seatsApi.list({ session_id: selectedSessionId })
      .then((res) => setSeats(res.data || []))
      .finally(() => setLoading(false));
  }, [selectedSessionId]);

  const zones = groupByZoneAndRow(seats);
  const total     = seats.length;
  const available = seats.filter((s) => s.display_status === "available").length;
  const booked    = seats.filter((s) => s.display_status === "booked").length;
  const reserved  = seats.filter((s) => s.display_status === "reserved").length;

  const stats = [
    { label: "Total Seats",     value: total,     color: "#7c3aed" },
    { label: "Available",       value: available, color: "#22c55e" },
    { label: "Booked",          value: booked,    color: "#ef4444" },
    { label: "Pending Payment", value: reserved,  color: "#f59e0b" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Seatings</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Real-time seat occupancy by concert session</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: 18, borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        {/* Selectors */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Seating Map</span>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "2px 0 0" }}>Hover a seat to see its ID</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select value={selectedConcertId} onChange={(e) => setSelectedConcertId(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              <option value="">Select Concert</option>
              {concerts.map((c) => <option key={c.concert_id} value={c.concert_id}>{c.concert_name}</option>)}
            </select>
            <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} disabled={!selectedConcertId}
              style={{ padding: "6px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              <option value="">Select Session</option>
              {sessions.map((s) => <option key={s.session_id} value={s.session_id}>{s.session_name} ({s.show_date} · {s.start_time?.slice(0,5)})</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>Loading Seat Map...</div>
        ) : !selectedSessionId ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 12 }}>
            Select a concert and session to view seating
          </div>
        ) : Object.keys(zones).length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 12 }}>
            No seat data for this session
          </div>
        ) : (
          <>
            {/* Stage */}
            <div style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", borderRadius: "50% 50% 0 0 / 30% 30% 0 0", padding: "12px 0", textAlign: "center", marginBottom: 20, color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 6, boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
              STAGE
            </div>

            {/* Zones */}
            {Object.entries(zones).map(([zoneId, zone]) => {
              const zs = getZoneStyle(zone.name, zone.type);
              const isUpper = zone.name.toLowerCase().includes("upper");
              return (
                <div key={zoneId}>
                  {isUpper && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px" }}>
                      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                      <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>— UPPER LEVEL —</span>
                      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    </div>
                  )}
                  <div style={{ background: zs.bg, border: `1.5px solid ${zs.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                    {/* Zone header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${zs.border}40` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: zs.label }} />
                        <span style={{ fontWeight: 700, fontSize: 12, color: zs.text }}>{zone.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: zs.label }}>THB {Number(zone.price).toLocaleString()}/seat</span>
                    </div>

                    {/* Rows with center aisle */}
                    <div style={{ overflowX: "auto" }}>
                      {Object.entries(zone.rows).map(([row, rowSeats]) => {
                        const mid = Math.ceil(rowSeats.length / 2);
                        return (
                          <div key={row} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
                            <span style={{ width: 22, fontSize: 10, fontWeight: 600, color: "#9ca3af", textAlign: "right", flexShrink: 0 }}>{row}</span>
                            <div style={{ display: "flex", gap: 2 }}>
                              {rowSeats.slice(0, mid).map((seat) => (
                                <SeatDot key={seat.seat_id} status={seat.display_status} title={seat.seat_no} />
                              ))}
                            </div>
                            <div style={{ width: 10, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                              <div style={{ width: 1, height: 14, background: "#e5e7eb" }} />
                            </div>
                            <div style={{ display: "flex", gap: 2 }}>
                              {rowSeats.slice(mid).map((seat) => (
                                <SeatDot key={seat.seat_id} status={seat.display_status} title={seat.seat_no} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
              {[{ color: "#22c55e", label: "Available" }, { color: "#ef4444", label: "Booked" }, { color: "#f59e0b", label: "Pending Payment" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <div style={{ width: 14, height: 12, borderRadius: 3, background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
