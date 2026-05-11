import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { customerApi } from "../../api/index.js";
import { useCustomerAuth } from "../../utils/CustomerAuthContext.jsx";

const statusColor = {
  confirmed: { bg: "#dcfce7", color: "#16a34a", label: "ยืนยันแล้ว" },
  pending:   { bg: "#fef9c3", color: "#a16207", label: "รอชำระ" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "ยกเลิก" },
};
const payStatusColor = {
  completed: { bg: "#dcfce7", color: "#16a34a" },
  pending:   { bg: "#fef9c3", color: "#a16207" },
  refunded:  { bg: "#e0e7ff", color: "#4338ca" },
  failed:    { bg: "#fee2e2", color: "#dc2626" },
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=60";

const sortSeats = (seats) => {
  return [...(seats || [])].sort((a, b) => {
    const rowA = a.seat_no.replace(/\d+$/, "");
    const rowB = b.seat_no.replace(/\d+$/, "");
    if (rowA !== rowB) return rowA.localeCompare(rowB);
    const numA = parseInt(a.seat_no.match(/\d+$/)?.[0] || 0, 10);
    const numB = parseInt(b.seat_no.match(/\d+$/)?.[0] || 0, 10);
    return numA - numB;
  });
};

function TicketModal({ booking, onClose }) {
  const seats = sortSeats(booking.seats);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>บัตรคอนเสิร์ต</h3>

        {seats.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>ไม่พบข้อมูลที่นั่ง</p>
        ) : seats.map((seat, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 12 }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", padding: "14px 18px", color: "#fff" }}>
              <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 2 }}>♪ EventBok Concert Ticket</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{booking.concert_name}</div>
            </div>
            <div style={{ borderTop: "2px dashed #e5e7eb", margin: "0 14px" }} />
            <div style={{ display: "flex", padding: "14px 18px", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Info label="ที่นั่ง" value={seat.seat_no} big />
                <Info label="โซน" value={seat.zone_name} />
                <Info label="วันที่" value={booking.show_date} />
                <Info label="รอบ" value={booking.session_name} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ padding: 8, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                  <QRCodeSVG value={seat.qr_code || `EVENTBOK-${booking.booking_id}-${seat.seat_no}`} size={70} />
                </div>
                <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 4 }}>สแกนตรวจสอบ</div>
              </div>
            </div>
            <div style={{ background: "#f9fafb", padding: "7px 18px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
              <span>Booking #{booking.booking_id}</span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ CONFIRMED</span>
            </div>
          </div>
        ))}

        <button onClick={onClose} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}>
          ปิด
        </button>
      </div>
    </div>
  );
}

function Info({ label, value, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 10, color: "#9ca3af", minWidth: 44 }}>{label}</span>
      <span style={{ fontSize: big ? 15 : 11, fontWeight: big ? 800 : 600, color: big ? "#7c3aed" : "#111" }}>{value}</span>
    </div>
  );
}

export default function MyBookings() {
  const { customer, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/user/login"); return; }
    customerApi.myBookings()
      .then((r) => setBookings(r.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <div>
      {viewing && <TicketModal booking={viewing} onClose={() => setViewing(null)} />}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>ตั๋วของฉัน</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>สวัสดี {customer?.firstname} {customer?.lastname}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>กำลังโหลด...</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
          <p style={{ color: "#9ca3af", fontSize: 15, marginBottom: 16 }}>ยังไม่มีการจอง</p>
          <button onClick={() => navigate("/user")} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            ดูคอนเสิร์ตทั้งหมด
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bookings.map((b) => (
            <div key={b.booking_id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", display: "flex" }}>
              {/* Cover image strip */}
              <div style={{ width: 100, flexShrink: 0 }}>
                <img src={b.cover_url || PLACEHOLDER} alt={b.concert_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = PLACEHOLDER; }} />
              </div>
              {/* Info */}
              <div style={{ flex: 1, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700 }}>{b.concert_name}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{b.session_name} · {b.show_date}</p>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusColor[b.status]?.bg, color: statusColor[b.status]?.color, flexShrink: 0 }}>
                    {statusColor[b.status]?.label || b.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280", marginBottom: 10, flexWrap: "wrap" }}>
                  <span>📍 {b.venue_name}</span>
                  <span>💺 {sortSeats(b.seats).map((s) => s.seat_no).join(", ") || "-"}</span>
                  <span>💰 ${b.total_price}</span>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: payStatusColor[b.payment_status]?.bg || "#f3f4f6", color: payStatusColor[b.payment_status]?.color || "#374151" }}>
                    {b.payment_status}
                  </span>
                  {b.status === "confirmed" && (
                    <button onClick={() => setViewing(b)}
                      style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      🎫 ดูบัตร
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
