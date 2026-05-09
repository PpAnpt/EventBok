import { useState } from "react";

const venueData = {
  "Grand Arena": {
    concerts: ["Rock Night 2026", "Pop Fest"],
    zones: [
      { name: "VIP ZONE",     price: 350, seats: { A: 12, B: 12 }, booked: { A: [9], B: [7] },           reserved: { A: [], B: [4,5,6] } },
      { name: "PREMIUM ZONE", price: 200, seats: { C: 12, D: 12 }, booked: { C: [1,7,10,11], D: [2,11] }, reserved: { C: [], D: [6,7] } },
      { name: "REGULAR ZONE", price: 80,  seats: { E: 12, F: 12, G: 12, H: 12 }, booked: {}, reserved: {} },
    ],
  },
  "Blue Note Hall": {
    concerts: ["Jazz Evening"],
    zones: [
      { name: "VIP ZONE",     price: 300, seats: { A: 10, B: 10 }, booked: { A: [1,2] }, reserved: { B: [3,4] } },
      { name: "REGULAR ZONE", price: 100, seats: { C: 10, D: 10 }, booked: {}, reserved: {} },
    ],
  },
  "Concert Hall": {
    concerts: ["Classical Symphony"],
    zones: [
      { name: "PREMIUM ZONE", price: 250, seats: { A: 10, B: 10 }, booked: { A: [1,2,3,4,5,6,7,8,9,10], B: [1,2,3,4,5,6,7,8,9,10] }, reserved: {} },
      { name: "REGULAR ZONE", price: 100, seats: { C: 10, D: 10 }, booked: { C: [1,2,3,4], D: [1,2] }, reserved: {} },
    ],
  },
};

function SeatCircle({ status }) {
  const colors = { available: "#22c55e", booked: "#ef4444", reserved: "#9ca3af" };
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8,
      background: colors[status] || "#e5e7eb",
      cursor: "pointer", transition: "transform 0.1s",
    }} />
  );
}

function calcStats(zones) {
  let total = 0, booked = 0, reserved = 0;
  zones.forEach((zone) => {
    Object.entries(zone.seats).forEach(([row, count]) => {
      total += count;
      booked += zone.booked[row]?.length ?? 0;
      reserved += zone.reserved[row]?.length ?? 0;
    });
  });
  return [
    { label: "Total Seats",        value: total,               color: "#7c3aed" },
    { label: "Available",          value: total - booked - reserved, color: "#10b981" },
    { label: "Booked / เต็ม",       value: booked,              color: "#ef4444" },
    { label: "Pending Payment",    value: reserved,             color: "#9ca3af" },
  ];
}

export default function Seatings() {
  const venues = Object.keys(venueData);
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);
  const [selectedConcert, setSelectedConcert] = useState(venueData[venues[0]].concerts[0]);

  const { zones, concerts } = venueData[selectedVenue];
  const stats = calcStats(zones);

  const handleVenueChange = (v) => {
    setSelectedVenue(v);
    setSelectedConcert(venueData[v].concerts[0]);
  };

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
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: 0 }}>เลือก Template ผังที่นั่ง, venue และ concert</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select value={selectedVenue} onChange={(e) => handleVenueChange(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              {venues.map((v) => <option key={v}>{v}</option>)}
            </select>
            <select value={selectedConcert} onChange={(e) => setSelectedConcert(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              {concerts.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #e9d5ff 0%, #bfdbfe 100%)", borderRadius: 12, padding: "12px", textAlign: "center", marginBottom: 24, fontSize: 14, fontWeight: 700, color: "#7c3aed", letterSpacing: 4 }}>
          ✦ STAGE ✦
        </div>

        {zones.map((zone) => (
          <div key={zone.name} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary)" }}>{zone.name}</span>
              <span style={{ fontSize: 12, color: "#7c3aed", background: "#f3f0ff", padding: "2px 8px", borderRadius: 8 }}>${zone.price}/seat</span>
            </div>
            {Object.entries(zone.seats).map(([row, count]) => (
              <div key={row} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 16, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>{row}</span>
                {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
                  const isBooked   = zone.booked[row]?.includes(n);
                  const isReserved = zone.reserved[row]?.includes(n);
                  return <SeatCircle key={n} status={isBooked ? "booked" : isReserved ? "reserved" : "available"} />;
                })}
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
      </div>
    </div>
  );
}
