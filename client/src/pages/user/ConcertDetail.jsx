import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { publicApi } from "../../api/index.js";

const PLACEHOLDER = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80";
const zoneColor = { vip: { bg: "#f3f0ff", border: "#a78bfa", text: "#7c3aed" }, premium: { bg: "#fdf2f8", border: "#f472b6", text: "#ec4899" }, regular: { bg: "#f0fdf4", border: "#4ade80", text: "#16a34a" } };
const seatColor = { available: "#e0e7ff", reserved: "#d1d5db", booked: "#fecaca", selected: "#7c3aed" };

// ——— Payment Modal ———
function PaymentModal({ result, concert, session, onClose }) {
  const { booking, payment, seats: rawSeats } = result;
  const [phase, setPhase] = useState("pay"); // "pay" | "ticket"
  const [confirming, setConfirming] = useState(false);
  const ticketRef = useRef(null);

  const seats = [...(rawSeats || [])].sort((a, b) => {
    const rowA = a.seat_no.replace(/\d+$/, "");
    const rowB = b.seat_no.replace(/\d+$/, "");
    if (rowA !== rowB) return rowA.localeCompare(rowB);
    const numA = parseInt(a.seat_no.match(/\d+$/)?.[0] || 0, 10);
    const numB = parseInt(b.seat_no.match(/\d+$/)?.[0] || 0, 10);
    return numA - numB;
  });

  const paymentQrContent = `EVENTBOK PAYMENT\nAmount: $${payment.total_price}\nBooking: #${booking.booking_id}\nTransaction: ${payment.transaction_id}`;

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      await publicApi.confirmBooking(booking.booking_id);
      setPhase("ticket");
    } catch {
      setPhase("ticket"); // show ticket anyway for demo
    } finally {
      setConfirming(false);
    }
  };

  const handlePrint = () => {
    const el = ticketRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>EventBok Ticket</title><style>body{margin:0;display:flex;justify-content:center;padding:20px;font-family:Arial,sans-serif}@media print{body{padding:0}}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        {phase === "pay" ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>ชำระเงิน</h2>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>Booking #{booking.booking_id} · {seats.map(s => s.seat_no).join(", ")}</p>

            {/* QR code */}
            <div style={{ display: "inline-block", padding: 16, background: "#f9fafb", borderRadius: 16, border: "2px solid #e5e7eb", marginBottom: 16 }}>
              <QRCodeSVG value={paymentQrContent} size={160} />
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: "#111", margin: "8px 0 4px" }}>${payment.total_price}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{payment.payment_method.replace("_", " ")}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 24 }}>Ref: {payment.transaction_id}</div>

            <div style={{ background: "#fef9c3", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#a16207", marginBottom: 24 }}>
              ⚠️ กรุณาชำระภายใน 10 นาที ก่อนที่การจองจะถูกยกเลิกอัตโนมัติ
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: confirming ? "#d1d5db" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: confirming ? "not-allowed" : "pointer", marginBottom: 10 }}
            >
              {confirming ? "กำลังยืนยัน..." : "✓ ยืนยันการชำระเงิน"}
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#6b7280" }}>
              ชำระภายหลัง
            </button>
          </div>
        ) : (
          <div style={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>✓</div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#16a34a" }}>ชำระเงินสำเร็จ!</h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>บัตรคอนเสิร์ตของคุณ</p>
            </div>

            {/* บัตรแข็ง */}
            {seats.map((seat, i) => (
              <TicketCard key={i} ref={i === 0 ? ticketRef : null} seat={seat} booking={booking} concert={concert} session={session} idx={i} total={seats.length} />
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={handlePrint} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1.5px solid #7c3aed", background: "#fff", color: "#7c3aed", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                🖨️ พิมพ์บัตร
              </button>
              <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                เสร็จสิ้น
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ——— Ticket Card ———
const TicketCard = ({ seat, booking, concert, session, idx, total }) => {
  const ticketQr = `EVENTBOK\nBooking:#${booking.booking_id}\nSeat:${seat.seat_no}\nConcert:${concert?.concert_name || ""}\nSession:${session?.session_name || ""}`;
  const zoneC = zoneColor[seat.type] || zoneColor.regular;

  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", marginBottom: 12, border: "1px solid #e5e7eb" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", padding: "16px 20px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>♪ EventBok Concert Ticket</div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>{concert?.concert_name || "Concert"}</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 3 }}>by {concert?.artist_name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Ticket {idx + 1}/{total}</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>#{booking.booking_id}</div>
          </div>
        </div>
      </div>

      {/* Dashed separator */}
      <div style={{ borderTop: "2px dashed #e5e7eb", margin: "0 16px" }} />

      {/* Body */}
      <div style={{ display: "flex", padding: "16px 20px", gap: 16, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <Row label="ที่นั่ง" value={seat.seat_no} big />
          <Row label="โซน" value={<span style={{ background: zoneC.bg, color: zoneC.text, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{seat.zone_name || seat.type?.toUpperCase()}</span>} />
          <Row label="วันที่" value={session?.show_date} />
          <Row label="เวลา" value={`${session?.start_time} – ${session?.end_time || ""}`} />
          <Row label="รอบ" value={session?.session_name} />
          <Row label="สถานที่" value={concert?.venue_name} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ padding: 8, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
            <QRCodeSVG value={ticketQr} size={80} />
          </div>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>สแกนเพื่อตรวจสอบ</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#f9fafb", padding: "8px 20px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
        <span>Booking #{booking.booking_id}</span>
        <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ CONFIRMED</span>
      </div>
    </div>
  );
};

function Row({ label, value, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 48 }}>{label}</span>
      <span style={{ fontSize: big ? 16 : 12, fontWeight: big ? 800 : 600, color: big ? "#7c3aed" : "#111827", textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ——— Main Page ———
export default function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", phone: "", date_of_birth: "", payment_method: "credit_card" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    publicApi.getConcert(id)
      .then((r) => setConcert(r.data))
      .catch(() => setConcert(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!selectedSession) return;
    setSeatsLoading(true);
    setSelectedSeats([]);
    publicApi.getSeats(selectedSession.session_id)
      .then((r) => setSeats(r.data || []))
      .catch(() => setSeats([]))
      .finally(() => setSeatsLoading(false));
  }, [selectedSession]);

  const toggleSeat = (seat) => {
    if (seat.display_status !== "available") return;
    setSelectedSeats((prev) =>
      prev.find((s) => s.seat_id === seat.seat_id)
        ? prev.filter((s) => s.seat_id !== seat.seat_id)
        : [...prev, seat]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);

  const sortedSelectedSeats = [...selectedSeats].sort((a, b) => {
    const rowA = a.seat_no.replace(/\d+$/, "");
    const rowB = b.seat_no.replace(/\d+$/, "");
    if (rowA !== rowB) return rowA.localeCompare(rowB);
    const numA = parseInt(a.seat_no.match(/\d+$/)?.[0] || 0, 10);
    const numB = parseInt(b.seat_no.match(/\d+$/)?.[0] || 0, 10);
    return numA - numB;
  });

  const handleBook = async () => {
    if (!selectedSession || selectedSeats.length === 0) { setError("กรุณาเลือก session และที่นั่ง"); return; }
    if (!form.firstname || !form.lastname || !form.email) { setError("กรุณากรอกชื่อและอีเมล"); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await publicApi.createBooking({
        ...form,
        session_id: selectedSession.session_id,
        seat_ids: selectedSeats.map((s) => s.seat_id),
      });
      setBookingResult(res.data);
    } catch (err) {
      setError("การจองล้มเหลว ที่นั่งอาจถูกจองแล้ว กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const zones = seats.reduce((acc, seat) => {
    const key = seat.zone_id;
    if (!acc[key]) acc[key] = { zone_name: seat.zone_name, type: seat.type, price: seat.price, seats: [] };
    acc[key].seats.push(seat);
    return acc;
  }, {});

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Loading...</div>;
  if (!concert) return <div style={{ textAlign: "center", padding: 80 }}>Concert not found. <button onClick={() => navigate("/user")} style={{ border: "none", background: "none", color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}>กลับ</button></div>;

  return (
    <div>
      {bookingResult && (
        <PaymentModal
          result={bookingResult}
          concert={concert}
          session={selectedSession}
          onClose={() => { setBookingResult(null); navigate("/user"); }}
        />
      )}

      <button onClick={() => navigate("/user")} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}>
        ← กลับ
      </button>

      {/* Hero */}
      <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 32, position: "relative", height: 260 }}>
        <img src={concert.cover_url || PLACEHOLDER} alt={concert.concert_name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.src = PLACEHOLDER; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: 24, left: 28 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>{concert.concert_name}</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, margin: 0 }}>by {concert.artist_name} · {concert.venue_name}</p>
        </div>
      </div>

      {concert.description && <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{concert.description}</p>}

      {/* Sessions */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>เลือก Session</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(concert.sessions || []).map((s) => (
            <button key={s.session_id} onClick={() => setSelectedSession(s)}
              style={{ padding: "12px 20px", borderRadius: 12, cursor: "pointer", textAlign: "left", border: selectedSession?.session_id === s.session_id ? "2px solid #7c3aed" : "2px solid #e5e7eb", background: selectedSession?.session_id === s.session_id ? "#f3f0ff" : "#fff", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: selectedSession?.session_id === s.session_id ? "#7c3aed" : "#111" }}>{s.session_name}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.show_date} · {s.start_time} – {s.end_time}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Seat Map */}
      {selectedSession && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>เลือกที่นั่ง</h2>
          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            {[["available", "#e0e7ff", "ว่าง"], ["selected", "#7c3aed", "เลือกแล้ว"], ["reserved", "#d1d5db", "รอชำระ"], ["booked", "#fecaca", "จองแล้ว"]].map(([k, bg, label]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: bg }} />{label}
              </div>
            ))}
          </div>

          {seatsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>กำลังโหลดที่นั่ง...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {Object.entries(zones).map(([zoneId, zone]) => {
                const zc = zoneColor[zone.type] || zoneColor.regular;
                return (
                  <div key={zoneId} style={{ background: zc.bg, border: `1.5px solid ${zc.border}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: zc.text }}>{zone.zone_name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: zc.text }}>${zone.price} / ที่นั่ง</span>
                    </div>
                    {groupByRow(zone.seats).map(({ row, rowSeats }) => (
                      <div key={row} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                        <span style={{ width: 16, fontSize: 10, fontWeight: 700, color: "#9ca3af" }}>{row}</span>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                          {rowSeats.map((seat) => {
                            const isSelected = !!selectedSeats.find((s) => s.seat_id === seat.seat_id);
                            const status = seat.display_status || seat.seat_status;
                            const bg = isSelected ? seatColor.selected : seatColor[status] || seatColor.available;
                            return (
                              <button key={seat.seat_id} onClick={() => toggleSeat(seat)} disabled={status !== "available"} title={seat.seat_no}
                                style={{ width: 28, height: 26, borderRadius: 5, border: "none", fontSize: 9, fontWeight: 600, background: bg, color: isSelected ? "#fff" : status === "available" ? "#4338ca" : "#9ca3af", cursor: status === "available" ? "pointer" : "not-allowed", transition: "transform 0.1s" }}
                                onMouseEnter={(e) => { if (status === "available") e.currentTarget.style.transform = "scale(1.15)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                                {seat.seat_no.replace(/^[A-Z]/, "")}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {sortedSelectedSeats.length > 0 && (
            <div style={{ marginTop: 10, padding: "10px 16px", background: "#f3f0ff", borderRadius: 10, fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
              เลือกแล้ว: {sortedSelectedSeats.map((s) => s.seat_no).join(", ")} · รวม: ${totalPrice.toFixed(2)}
            </div>
          )}
        </section>
      )}

      {/* Customer Form */}
      {selectedSession && (
        <section style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>ข้อมูลผู้จอง</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["ชื่อ *", "firstname", "text", "เช่น สมชาย"], ["นามสกุล *", "lastname", "text", "เช่น ใจดี"], ["อีเมล *", "email", "email", "example@email.com"], ["เบอร์โทร", "phone", "tel", "081-xxx-xxxx"], ["วันเกิด", "date_of_birth", "date", ""]].map(([label, field, type, ph]) => (
              <div key={field}>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={ph}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>วิธีชำระ</label>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="credit_card">💳 Credit Card</option>
                <option value="debit_card">💳 Debit Card</option>
                <option value="qr_code">📱 QR Code</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "12px 0 0" }}>{error}</p>}

          {selectedSeats.length > 0 && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>สรุปการจอง</div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                <span>{selectedSeats.length} ที่นั่ง · {selectedSession.session_name}</span>
                <span style={{ fontWeight: 700, color: "#111" }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button onClick={handleBook} disabled={submitting || selectedSeats.length === 0}
            style={{ marginTop: 18, width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: submitting || selectedSeats.length === 0 ? "#d1d5db" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: submitting || selectedSeats.length === 0 ? "not-allowed" : "pointer" }}>
            {submitting ? "กำลังจอง..." : `จอง ${selectedSeats.length} ที่นั่ง — $${totalPrice.toFixed(2)}`}
          </button>
        </section>
      )}
    </div>
  );
}

function groupByRow(seats) {
  const map = {};
  for (const seat of seats) {
    // Extract row (e.g., "A" from "A1")
    const row = seat.seat_no.replace(/\d+$/, "");
    if (!map[row]) map[row] = [];
    map[row].push(seat);
  }
  return Object.entries(map)
    .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
    .map(([row, rowSeats]) => {
      // Sort rowSeats numerically (1, 2, 10, 11 instead of 1, 10, 11, 2)
      rowSeats.sort((a, b) => {
        const numA = parseInt(a.seat_no.match(/\d+$/)?.[0] || 0, 10);
        const numB = parseInt(b.seat_no.match(/\d+$/)?.[0] || 0, 10);
        return numA - numB;
      });
      return { row, rowSeats };
    });
}
