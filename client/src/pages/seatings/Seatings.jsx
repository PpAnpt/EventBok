const zones = [
  { name: "VIP ZONE",     type: "vip",     price: 350, rows: { A: 12, B: 12 },
    seats: { A: [1,2,3,4,5,6,7,8,9,10,11,12], B: [1,2,3,4,5,6,7,8,9,10,11,12] },
    booked: { A: [9], B: [7] }, reserved: { A: [], B: [4,5,6] } },
  { name: "PREMIUM ZONE", type: "premium", price: 200, rows: { C: 12, D: 12 },
    seats: { C: [1,2,3,4,5,6,7,8,9,10,11,12], D: [1,2,3,4,5,6,7,8,9,10,11,12] },
    booked: { C: [1,7,10,11], D: [2,11] }, reserved: { C: [], D: [6,7] } },
  { name: "REGULAR ZONE", type: "regular", price: 80,  rows: { E: 12, F: 12, G: 12, H: 12 },
    seats: { E: [1,2,3,4,5,6,7,8,9,10,11,12], F: [1,2,3,4,5,6,7,8,9,10,11,12], G: [1,2,3,4,5,6,7,8,9,10,11,12], H: [1,2,3,4,5,6,7,8,9,10,11,12] },
    booked: {}, reserved: {} },
];

const zoneStats = [
  { label: "Total Seats", value: 96, color: "#7c3aed", bg: "#f3f0ff" },
  { label: "Available",   value: 58, color: "#10b981", bg: "#ecfdf5" },
  { label: "Booked / เต็ม", value: 26, color: "#ef4444", bg: "#fee2e2" },
  { label: "Paying / กำลังจ่าย", value: 12, color: "#9ca3af", bg: "#f9fafb" },
];

function SeatCircle({ status }) {
  const colors = { available: "#22c55e", booked: "#ef4444", reserved: "#f87171" };
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8,
      background: colors[status] || "#e5e7eb",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", transition: "transform 0.1s"
    }} />
  );
}

export default function Seatings() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Seatings</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Seating Management</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 20px" }}>Manage venue seating zones, pricing, and availability</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {zoneStats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: 18, borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Seating Map */}
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
            <select style={{ padding: "6px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              <option>Grand Arena</option>
            </select>
            <select style={{ padding: "6px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              <option>Rock Night 2026</option>
            </select>
          </div>
        </div>

        {/* Stage */}
        <div style={{ background: "linear-gradient(135deg, #e9d5ff 0%, #bfdbfe 100%)", borderRadius: 12, padding: "12px", textAlign: "center", marginBottom: 24, fontSize: 14, fontWeight: 700, color: "#7c3aed", letterSpacing: 4 }}>
          ✦ STAGE ✦
        </div>

        {/* Zones */}
        {zones.map((zone) => (
          <div key={zone.name} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary)" }}>{zone.name}</span>
              <span style={{ fontSize: 12, color: "#7c3aed", background: "#f3f0ff", padding: "2px 8px", borderRadius: 8 }}>${zone.price}/seat</span>
            </div>
            {Object.entries(zone.seats).map(([row, seatNums]) => (
              <div key={row} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 16, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>{row}</span>
                {seatNums.map((n) => {
                  const isBooked = zone.booked[row]?.includes(n);
                  const isReserved = zone.reserved[row]?.includes(n);
                  return <SeatCircle key={n} status={isBooked ? "booked" : isReserved ? "reserved" : "available"} />;
                })}
              </div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--color-border)" }}>
          {[{ color: "#22c55e", label: "Available" }, { color: "#ef4444", label: "Booked" }, { color: "#f87171", label: "Reserved" }].map((l) => (
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
