import { useState, useEffect } from "react";
import { organizerPortalApi } from "../../api/index.js";

const bookingStatus = { confirmed: { bg: "#dcfce7", color: "#16a34a" }, pending: { bg: "#fef9c3", color: "#a16207" }, cancelled: { bg: "#fee2e2", color: "#dc2626" } };
const payStatus = { completed: { bg: "#dcfce7", color: "#16a34a" }, pending: { bg: "#fef9c3", color: "#a16207" }, refunded: { bg: "#e0e7ff", color: "#4338ca" }, failed: { bg: "#fee2e2", color: "#dc2626" } };

export default function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    organizerPortalApi.myBookings()
      .then((r) => setBookings(r.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) =>
    !search ||
    `${b.firstname} ${b.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
    b.concert_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Bookings</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>All bookings for your concerts (read-only)</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          ["Total Bookings", bookings.length, "#7c3aed"],
          ["Confirmed", bookings.filter(b => b.status === "confirmed").length, "#16a34a"],
          ["Revenue", `$${totalRevenue.toLocaleString()}`, "#f59e0b"],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <input placeholder="Search customer name, concert, or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No results found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["#", "Customer", "Concert", "Session", "Date", "Amount", "Payment", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.booking_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>{b.booking_id}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.firstname} {b.lastname}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{b.customer_email}</div>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13 }}>{b.concert_name}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#6b7280" }}>{b.session_name}<br/><span style={{ fontSize: 11 }}>{b.show_date}</span></td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#6b7280" }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#10b981" }}>${b.total_price}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, ...payStatus[b.payment_status] }}>{b.payment_status}</span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, ...bookingStatus[b.status] }}>{b.status}</span>
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
