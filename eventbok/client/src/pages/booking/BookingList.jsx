import { useState } from "react";

const mockBookings = [
  { booking_id: "BK001", customer: "John Smith",    concert: "Rock Night 2026",    seats: ["A5","A6"], session: "Night 1",       session_date: "15 Apr 2026", status: "confirmed", amount: 700 },
  { booking_id: "BK002", customer: "Sarah Johnson", concert: "Jazz Evening",       seats: ["B3"],      session: "Opening Night", session_date: "20 Apr 2026", status: "confirmed", amount: 200 },
  { booking_id: "BK003", customer: "Mike Brown",    concert: "Pop Fest",           seats: ["C10","C11","C12"], session: "Day 1 - PM", session_date: "01 May 2026", status: "pending", amount: 240 },
  { booking_id: "BK004", customer: "Emily Davis",   concert: "Classical Symphony", seats: ["A1","A2"], session: "Gala Night",    session_date: "10 Mar 2026", status: "confirmed", amount: 700 },
  { booking_id: "BK005", customer: "David Wilson",  concert: "Rock Night 2026",    seats: ["D8"],      session: "Night 2",       session_date: "16 Apr 2026", status: "cancelled", amount: 80 },
  { booking_id: "BK006", customer: "Lisa Anderson", concert: "Jazz Evening",       seats: ["A7","A8"], session: "Opening Night", session_date: "20 Apr 2026", status: "confirmed", amount: 700 },
  { booking_id: "BK007", customer: "Robert Taylor", concert: "Pop Fest",           seats: ["E5"],      session: "Day 2",         session_date: "02 May 2026", status: "pending", amount: 80 },
];

const statusColor = { confirmed: { bg: "#dcfce7", color: "#16a34a" }, pending: { bg: "#fef9c3", color: "#a16207" }, cancelled: { bg: "#fee2e2", color: "#dc2626" } };

export default function BookingList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockBookings.filter((b) => {
    const matchSearch = b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.concert.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Booking</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, alignItems: "center" }}>
          <input
            placeholder="Search by name, concert, or booking ID..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, flex: 1, outline: "none" }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["ID", "Concert", "Session", "Status", "Amount", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.booking_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 13 }}>{b.booking_id}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{b.customer}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b.concert}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {b.seats.map((s) => (
                      <span key={s} style={{ background: "#f0f0f0", padding: "1px 7px", borderRadius: 6, fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                    {b.session}
                  </div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{b.session_date}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor[b.status]?.bg, color: statusColor[b.status]?.color }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#10b981" }}>${b.amount}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["👁", b.status === "pending" ? "✓" : null, "✕", "🗑"].filter(Boolean).map((icon, i) => (
                      <button key={i} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4, borderRadius: 6 }}>{icon}</button>
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
