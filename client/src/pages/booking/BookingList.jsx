import { useState, useEffect } from "react";
import { bookingsApi } from "../../api/index.js";

const statusColor = { confirmed: { bg: "#dcfce7", color: "#16a34a" }, pending: { bg: "#fef9c3", color: "#a16207" }, cancelled: { bg: "#fee2e2", color: "#dc2626" } };

function ViewModal({ booking, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>Booking Detail</h3>
        {[
          ["Booking ID", booking.booking_id],
          ["Customer", `${booking.firstname} ${booking.lastname}`],
          ["Concert", booking.concert_name],
          ["Session", booking.session_name],
          ["Session Date", booking.show_date],
          ["Seats", (booking.seats || []).map((s) => s.seat_no).join(", ")],
          ["Amount", booking.total_price ? `$${booking.total_price}` : "-"],
          ["Status", booking.status],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
            <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState(null);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await bookingsApi.list(params);
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const filtered = bookings.filter((b) => {
    const name = `${b.firstname} ${b.lastname}`.toLowerCase();
    return name.includes(search.toLowerCase()) ||
      b.concert_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.booking_id).includes(search);
  });

  const updateStatus = async (id, action) => {
    try {
      if (action === "confirm") await bookingsApi.confirm(id);
      else await bookingsApi.cancel(id);
      setBookings((prev) => prev.map((b) => b.booking_id === id ? { ...b, status: action === "confirm" ? "confirmed" : "cancelled" } : b));
    } catch { /* ignore */ }
  };

  const deleteBooking = async (id) => {
    try { await bookingsApi.delete(id); } catch { /* ignore */ }
    setBookings((prev) => prev.filter((b) => b.booking_id !== id));
  };

  return (
    <div>
      {viewing && <ViewModal booking={viewing} onClose={() => setViewing(null)} />}

      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Booking</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, alignItems: "center" }}>
          <input placeholder="Search by name, concert, or booking ID..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, flex: 1, outline: "none" }} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : (
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
                    <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{b.firstname} {b.lastname}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.concert_name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {(b.seats || []).map((s) => (
                        <span key={s.seat_no} style={{ background: "#f0f0f0", padding: "1px 7px", borderRadius: 6, fontSize: 11 }}>{s.seat_no}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                      {b.session_name}
                    </div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{b.show_date}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor[b.status]?.bg, color: statusColor[b.status]?.color }}>{b.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#10b981" }}>{b.total_price ? `$${b.total_price}` : "-"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewing(b)} title="View" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>👁</button>
                      {b.status === "pending" && <button onClick={() => updateStatus(b.booking_id, "confirm")} title="Confirm" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>✓</button>}
                      {b.status !== "cancelled" && <button onClick={() => updateStatus(b.booking_id, "cancel")} title="Cancel" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>✕</button>}
                      <button onClick={() => deleteBooking(b.booking_id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>🗑</button>
                    </div>
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
