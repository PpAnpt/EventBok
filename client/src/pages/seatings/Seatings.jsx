import { useState, useEffect } from "react";
import { concertsApi, sessionsApi, seatsApi } from "../../api/index.js";

function SeatCircle({ status, title }) {
  const colors = { available: "#22c55e", booked: "#ef4444", reserved: "#9ca3af" };
  return (
    <div
      title={title}
      style={{
        width: 26, height: 26, borderRadius: 8,
        background: colors[status] || "#e5e7eb",
        cursor: "pointer", transition: "transform 0.1s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    />
  );
}

function groupByZoneAndRow(seats) {
  const zones = {};
  seats.forEach(s => {
    if (!zones[s.zone_id]) {
      zones[s.zone_id] = {
        name: s.zone_name,
        type: s.type,
        price: s.price,
        rows: {}
      };
    }
    const row = s.seat_no.replace(/\d+$/, "");
    if (!zones[s.zone_id].rows[row]) {
      zones[s.zone_id].rows[row] = [];
    }
    zones[s.zone_id].rows[row].push(s);
  });

  // Sort rows within zones
  Object.values(zones).forEach(zone => {
    zone.rows = Object.fromEntries(
      Object.entries(zone.rows).sort(([a], [b]) => a.localeCompare(b))
    );
    // Sort seats within rows numerically
    Object.values(zone.rows).forEach(rowSeats => {
      rowSeats.sort((a, b) => {
        const numA = parseInt(a.seat_no.match(/\d+$/)?.[0] || 0, 10);
        const numB = parseInt(b.seat_no.match(/\d+$/)?.[0] || 0, 10);
        return numA - numB;
      });
    });
  });

  return zones;
}

export default function Seatings() {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcertId, setSelectedConcertId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    concertsApi.list().then(res => {
      setConcerts(res.data || []);
      if (res.data?.length > 0) setSelectedConcertId(res.data[0].concert_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedConcertId) return;
    sessionsApi.list({ concert_id: selectedConcertId }).then(res => {
      setSessions(res.data || []);
      if (res.data?.length > 0) setSelectedSessionId(res.data[0].session_id);
      else setSelectedSessionId("");
    });
  }, [selectedConcertId]);

  useEffect(() => {
    if (!selectedSessionId) {
      setSeats([]);
      return;
    }
    setLoading(true);
    seatsApi.list({ session_id: selectedSessionId })
      .then(res => setSeats(res.data || []))
      .finally(() => setLoading(false));
  }, [selectedSessionId]);

  const zones = groupByZoneAndRow(seats);

  const totalSeats = seats.length;
  const bookedCount = seats.filter(s => s.display_status === 'booked').length;
  const reservedCount = seats.filter(s => s.display_status === 'reserved').length;
  const availableCount = seats.filter(s => s.display_status === 'available').length;

  const stats = [
    { label: "Total Seats",     value: totalSeats,     color: "#7c3aed" },
    { label: "Available",       value: availableCount, color: "#10b981" },
    { label: "Booked / เต็ม",    value: bookedCount,    color: "#ef4444" },
    { label: "Pending Payment", value: reservedCount,  color: "#9ca3af" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Seatings</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Seating Management</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 20px" }}>Manage venue seating zones, pricing, and availability</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: 18, borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#67e8f9" }} />
              <span style={{ fontWeight: 600 }}>Seating Map</span>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: 0 }}>View real-time seating occupancy for each concert session</p>
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
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name} ({s.show_date} · {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>Loading Seat Map...</div>
        ) : !selectedSessionId ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 12 }}>
            Please select a concert and session to view seating
          </div>
        ) : (
          <>
            <div style={{ background: "linear-gradient(135deg, #e9d5ff 0%, #bfdbfe 100%)", borderRadius: 12, padding: "12px", textAlign: "center", marginBottom: 24, fontSize: 14, fontWeight: 700, color: "#7c3aed", letterSpacing: 4 }}>
              ✦ STAGE ✦
            </div>

            {Object.values(zones).map((zone) => (
              <div key={zone.name} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary)" }}>{zone.name}</span>
                  <span style={{ fontSize: 12, color: "#7c3aed", background: "#f3f0ff", padding: "2px 8px", borderRadius: 8 }}>${zone.price}/seat</span>
                </div>
                {Object.entries(zone.rows).map(([row, rowSeats]) => (
                  <div key={row} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ width: 16, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>{row}</span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {rowSeats.map((seat) => (
                        <SeatCircle key={seat.seat_id} status={seat.display_status} title={seat.seat_no} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display: "flex", gap: 20, marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--color-border)" }}>
              {[{ color: "#22c55e", label: "Available" }, { color: "#ef4444", label: "Booked" }, { color: "#9ca3af", label: "Pending Payment" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color }} />
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
