import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { publicApi } from "../../api/index.js";

const PLACEHOLDER = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80";

const seatBg = { available: "#e0e7ff", reserved: "#d1d5db", booked: "#fecaca", selected: "#7c3aed" };

// Zone color scheme — matches by zone name then falls back to type
function getZoneStyle(name = "", type = "regular") {
  const n = name.toLowerCase();
  if (n.includes("platinum"))  return { bg: "#f5f3ff", border: "#7c3aed", headerBg: "#ede9fe", text: "#5b21b6", label: "#7c3aed" };
  if (n.includes("gold"))      return { bg: "#fffbeb", border: "#f59e0b", headerBg: "#fef3c7", text: "#92400e", label: "#d97706" };
  if (type === "vip")          return { bg: "#f5f3ff", border: "#8b5cf6", headerBg: "#ede9fe", text: "#5b21b6", label: "#7c3aed" };
  if (n.includes("premium") || type === "premium")
                               return { bg: "#fdf2f8", border: "#ec4899", headerBg: "#fce7f3", text: "#9d174d", label: "#ec4899" };
  if (n.includes("upper"))     return { bg: "#f8fafc", border: "#94a3b8", headerBg: "#f1f5f9", text: "#334155", label: "#64748b" };
  return                               { bg: "#f0fdf4", border: "#22c55e", headerBg: "#dcfce7", text: "#14532d", label: "#16a34a" };
}

// Group seats by row, sorted numerically within each row
function groupByRow(seats) {
  const map = {};
  for (const seat of seats) {
    const row = seat.seat_no.replace(/\d+$/, "");
    if (!map[row]) map[row] = [];
    map[row].push(seat);
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([row, rowSeats]) => {
      rowSeats.sort((a, b) => parseInt(a.seat_no.match(/\d+$/)?.[0] || 0) - parseInt(b.seat_no.match(/\d+$/)?.[0] || 0));
      return { row, rowSeats };
    });
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ result, concert, session, onClose }) {
  const { booking, payment, seats: rawSeats } = result;
  const [phase, setPhase] = useState("pay");
  const [confirming, setConfirming] = useState(false);
  const ticketRef = useRef(null);

  const seats = [...(rawSeats || [])].sort((a, b) => {
    const rA = a.seat_no.replace(/\d+$/, ""), rB = b.seat_no.replace(/\d+$/, "");
    if (rA !== rB) return rA.localeCompare(rB);
    return parseInt(a.seat_no.match(/\d+$/)?.[0] || 0) - parseInt(b.seat_no.match(/\d+$/)?.[0] || 0);
  });

  const qrContent = `EVENTBOK PAYMENT\nAmount: THB ${payment.total_price}\nBooking: #${booking.booking_id}\nRef: ${payment.transaction_id}`;

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try { await publicApi.confirmBooking(booking.booking_id); setPhase("ticket"); }
    catch { setPhase("ticket"); }
    finally { setConfirming(false); }
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
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Payment</h2>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>
              Booking #{booking.booking_id} · {seats.map((s) => s.seat_no).join(", ")}
            </p>
            <div style={{ display: "inline-block", padding: 16, background: "#f9fafb", borderRadius: 16, border: "2px solid #e5e7eb", marginBottom: 16 }}>
              <QRCodeSVG value={qrContent} size={160} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#111", margin: "8px 0 4px" }}>THB {Number(payment.total_price).toLocaleString()}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{payment.payment_method.replace("_", " ")}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 24 }}>Ref: {payment.transaction_id}</div>
            <div style={{ background: "#fef9c3", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#a16207", marginBottom: 24 }}>
              Please complete payment within 10 minutes or your booking will be automatically cancelled.
            </div>
            <button onClick={handleConfirmPayment} disabled={confirming}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: confirming ? "#d1d5db" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: confirming ? "not-allowed" : "pointer", marginBottom: 10 }}>
              {confirming ? "Confirming..." : "Confirm Payment"}
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#6b7280" }}>
              Pay Later
            </button>
          </div>
        ) : (
          <div style={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>✓</div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#16a34a" }}>Payment Successful!</h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>Your concert tickets</p>
            </div>
            {seats.map((seat, i) => (
              <TicketCard key={i} ref={i === 0 ? ticketRef : null} seat={seat} booking={booking} concert={concert} session={session} idx={i} total={seats.length} />
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={handlePrint} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1.5px solid #7c3aed", background: "#fff", color: "#7c3aed", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Print Ticket</button>
              <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ticket Card ───────────────────────────────────────────────────────────────
const TicketCard = ({ seat, booking, concert, session, idx, total }) => {
  const ticketQr = `EVENTBOK\nBooking:#${booking.booking_id}\nSeat:${seat.seat_no}\nConcert:${concert?.concert_name || ""}\nSession:${session?.session_name || ""}`;
  const zs = getZoneStyle(seat.zone_name, seat.type);

  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", marginBottom: 12, border: "1px solid #e5e7eb" }}>
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", padding: "16px 20px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>EventBok Concert Ticket</div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>{concert?.concert_name || "Concert"}</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 3 }}>by {concert?.artist_name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Ticket {idx + 1}/{total}</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>#{booking.booking_id}</div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "2px dashed #e5e7eb", margin: "0 16px" }} />
      <div style={{ display: "flex", padding: "16px 20px", gap: 16, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <TicketRow label="Seat" value={seat.seat_no} big />
          <TicketRow label="Zone" value={<span style={{ background: zs.headerBg, color: zs.label, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{seat.zone_name}</span>} />
          <TicketRow label="Price" value={`THB ${Number(seat.price).toLocaleString()}`} />
          <TicketRow label="Date" value={session?.show_date} />
          <TicketRow label="Time" value={`${session?.start_time} – ${session?.end_time || ""}`} />
          <TicketRow label="Session" value={session?.session_name} />
          <TicketRow label="Venue" value={concert?.venue_name} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ padding: 8, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
            <QRCodeSVG value={ticketQr} size={80} />
          </div>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>Scan to verify</span>
        </div>
      </div>
      <div style={{ background: "#f9fafb", padding: "8px 20px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
        <span>Booking #{booking.booking_id}</span>
        <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ CONFIRMED</span>
      </div>
    </div>
  );
};

function TicketRow({ label, value, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 48 }}>{label}</span>
      <span style={{ fontSize: big ? 16 : 12, fontWeight: big ? 800 : 600, color: big ? "#7c3aed" : "#111827", textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── Seat Button ───────────────────────────────────────────────────────────────
function SeatBtn({ seat, isSelected, onToggle, zoneStyle }) {
  const status = seat.display_status || seat.seat_status;
  const available = status === "available";
  const bg = isSelected ? zoneStyle.label : seatBg[status] || seatBg.available;
  const textColor = isSelected ? "#fff" : available ? zoneStyle.label : "#9ca3af";

  return (
    <button
      onClick={() => available && onToggle(seat)}
      disabled={!available}
      title={`${seat.seat_no} · THB ${Number(seat.price).toLocaleString()}`}
      style={{
        width: 26, height: 22, borderRadius: 5,
        border: `1.5px solid ${isSelected ? zoneStyle.label : available ? `${zoneStyle.border}88` : "#e5e7eb"}`,
        fontSize: 8, fontWeight: 700,
        background: bg, color: textColor,
        cursor: available ? "pointer" : "not-allowed",
        transition: "transform 0.1s, background 0.1s",
        padding: 0, lineHeight: 1,
      }}
      onMouseEnter={(e) => { if (available) e.currentTarget.style.transform = "scale(1.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    >
      {seat.seat_no.replace(/^[A-Z]+/, "")}
    </button>
  );
}

// ── Row with center aisle ─────────────────────────────────────────────────────
function SeatRow({ row, rowSeats, selectedSeats, onToggle, zoneStyle }) {
  const mid = Math.ceil(rowSeats.length / 2);
  const leftSeats = rowSeats.slice(0, mid);
  const rightSeats = rowSeats.slice(mid);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
      <span style={{ width: 22, fontSize: 10, fontWeight: 700, color: "#9ca3af", textAlign: "right", flexShrink: 0 }}>{row}</span>
      <div style={{ display: "flex", gap: 2 }}>
        {leftSeats.map((s) => (
          <SeatBtn key={s.seat_id} seat={s} isSelected={!!selectedSeats.find((x) => x.seat_id === s.seat_id)} onToggle={onToggle} zoneStyle={zoneStyle} />
        ))}
      </div>
      {rightSeats.length > 0 && (
        <>
          <div style={{ width: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {rightSeats.map((s) => (
              <SeatBtn key={s.seat_id} seat={s} isSelected={!!selectedSeats.find((x) => x.seat_id === s.seat_id)} onToggle={onToggle} zoneStyle={zoneStyle} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeZoneId, setActiveZoneId] = useState(null); // null = zone picker, set = seat map
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", phone: "", date_of_birth: "", payment_method: "qr_code" });
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
    setActiveZoneId(null);
    publicApi.getSeats(selectedSession.session_id)
      .then((r) => setSeats(r.data || []))
      .catch(() => setSeats([]))
      .finally(() => setSeatsLoading(false));
  }, [selectedSession]);

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.find((s) => s.seat_id === seat.seat_id) ? prev.filter((s) => s.seat_id !== seat.seat_id) : [...prev, seat]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);

  const sortedSelected = [...selectedSeats].sort((a, b) => {
    const rA = a.seat_no.replace(/\d+$/, ""), rB = b.seat_no.replace(/\d+$/, "");
    if (rA !== rB) return rA.localeCompare(rB);
    return parseInt(a.seat_no.match(/\d+$/)?.[0] || 0) - parseInt(b.seat_no.match(/\d+$/)?.[0] || 0);
  });

  // Group seats by zone (preserving order from server)
  const zones = seats.reduce((acc, seat) => {
    const key = seat.zone_id;
    if (!acc[key]) acc[key] = { zone_name: seat.zone_name, type: seat.type, price: seat.price, seats: [] };
    acc[key].seats.push(seat);
    return acc;
  }, {});

  const handleBook = async () => {
    if (!selectedSession || selectedSeats.length === 0) { setError("Please select a session and seat"); return; }
    if (!form.firstname || !form.lastname || !form.email) { setError("Please enter your first name, last name, and email"); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await publicApi.createBooking({ ...form, session_id: selectedSession.session_id, seat_ids: selectedSeats.map((s) => s.seat_id) });
      setBookingResult(res.data);
    } catch {
      setError("Booking failed. The seat may already be taken. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Loading...</div>;
  if (!concert) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      Concert not found.{" "}
      <button onClick={() => navigate("/user")} style={{ border: "none", background: "none", color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}>Back</button>
    </div>
  );

  return (
    <div>
      {bookingResult && (
        <PaymentModal result={bookingResult} concert={concert} session={selectedSession} onClose={() => { setBookingResult(null); navigate("/user"); }} />
      )}

      <button onClick={() => navigate("/user")} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0 }}>
        Back
      </button>

      {/* Hero */}
      <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 32, position: "relative", aspectRatio: "210/297" }}>
        <img src={concert.cover_url || PLACEHOLDER} alt={concert.concert_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.src = PLACEHOLDER; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: 24, left: 28 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>{concert.concert_name}</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, margin: 0 }}>by {concert.artist_name} · {concert.venue_name}</p>
        </div>
      </div>

      {concert.description && <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{concert.description}</p>}

      {/* Sessions */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>Select Session</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(concert.sessions || []).map((s) => (
            <button key={s.session_id} onClick={() => setSelectedSession(s)}
              style={{ padding: "12px 20px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                border: selectedSession?.session_id === s.session_id ? "2px solid #7c3aed" : "2px solid #e5e7eb",
                background: selectedSession?.session_id === s.session_id ? "#f3f0ff" : "#fff", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: selectedSession?.session_id === s.session_id ? "#7c3aed" : "#111" }}>{s.session_name}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.show_date} · {s.start_time} – {s.end_time}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Seat Selection — 2-step: zone picker → seat map */}
      {selectedSession && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            {activeZoneId && (
              <button onClick={() => setActiveZoneId(null)}
                style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}>
                Back to Zones
              </button>
            )}
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {activeZoneId ? `Zone: ${zones[activeZoneId]?.zone_name}` : "Select Zone"}
            </h2>
          </div>

          {seatsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading seats...</div>
          ) : Object.keys(zones).length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", background: "#f9fafb", borderRadius: 12 }}>No seat data found</div>
          ) : !activeZoneId ? (
            /* ── Step 1: Zone Cards ── */
            <div>
              {/* Stage visual */}
              <div style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", borderRadius: "50% 50% 0 0/30% 30% 0 0", padding: "10px 0", textAlign: "center", marginBottom: 20, color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 6, boxShadow: "0 4px 16px rgba(124,58,237,0.25)" }}>
                STAGE
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(zones).map(([zoneId, zone]) => {
                  const zs = getZoneStyle(zone.zone_name, zone.type);
                  const available = zone.seats.filter((s) => (s.display_status || s.seat_status) === "available").length;
                  const total = zone.seats.length;
                  const selectedInZone = selectedSeats.filter((s) => String(s.zone_id) === zoneId).length;
                  const soldOut = available === 0;
                  return (
                    <button key={zoneId} onClick={() => !soldOut && setActiveZoneId(zoneId)} disabled={soldOut}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                        borderRadius: 14, border: `2px solid ${zs.border}`,
                        background: soldOut ? "#f9fafb" : zs.bg,
                        cursor: soldOut ? "not-allowed" : "pointer", textAlign: "left", opacity: soldOut ? 0.55 : 1,
                        transition: "box-shadow 0.15s" }}
                      onMouseEnter={(e) => { if (!soldOut) e.currentTarget.style.boxShadow = `0 4px 16px ${zs.border}44`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}>
                      {/* Color dot */}
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: zs.label, flexShrink: 0 }} />
                      {/* Zone info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: zs.text }}>{zone.zone_name}</span>
                          <span style={{ fontSize: 10, background: `${zs.label}18`, color: zs.label, padding: "1px 7px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase" }}>{zone.type}</span>
                          {selectedInZone > 0 && (
                            <span style={{ fontSize: 10, background: "#7c3aed", color: "#fff", padding: "1px 8px", borderRadius: 20, fontWeight: 700 }}>
                              {selectedInZone} selected
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {soldOut ? "Sold Out" : `Available: ${available.toLocaleString()} / ${total.toLocaleString()} seats`}
                        </div>
                      </div>
                      {/* Price + arrow */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: zs.label }}>THB {Number(zone.price).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>/ seat</div>
                      </div>
                      {!soldOut && <span style={{ fontSize: 18, color: zs.label, flexShrink: 0 }}>›</span>}
                    </button>
                  );
                })}
              </div>

              {/* Selected summary bar */}
              {sortedSelected.length > 0 && (
                <div style={{ marginTop: 14, padding: "12px 16px", background: "#f3f0ff", borderRadius: 12, fontSize: 13, color: "#7c3aed", fontWeight: 600, border: "1.5px solid #c4b5fd" }}>
                  {sortedSelected.length} selected · Total: THB {totalPrice.toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            /* ── Step 2: Seat Map for active zone ── */
            <div>
              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                {[["#e0e7ff","#4338ca","Available"],["#7c3aed","#fff","Selected"],["#d1d5db","#9ca3af","Pending"],["#fecaca","#ef4444","Booked"]].map(([bg, color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                    <div style={{ width: 16, height: 14, borderRadius: 3, background: bg, border: `1px solid ${color}40` }} />{label}
                  </div>
                ))}
              </div>

              {/* Stage banner */}
              <div style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", borderRadius: "50% 50% 0 0/30% 30% 0 0", padding: "14px 0", textAlign: "center", marginBottom: 16, color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 6, boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
                STAGE
              </div>

              {(() => {
                const zone = zones[activeZoneId];
                const zs = getZoneStyle(zone.zone_name, zone.type);
                const rows = groupByRow(zone.seats);
                return (
                  <div style={{ background: zs.bg, border: `1.5px solid ${zs.border}`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${zs.border}40` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: zs.label }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: zs.text }}>{zone.zone_name}</span>
                        <span style={{ fontSize: 10, color: zs.label, background: `${zs.label}18`, padding: "2px 8px", borderRadius: 20, fontWeight: 600, textTransform: "uppercase" }}>{zone.type}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: zs.label }}>THB {Number(zone.price).toLocaleString()} / seat</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      {rows.map(({ row, rowSeats }) => (
                        <SeatRow key={row} row={row} rowSeats={rowSeats} selectedSeats={selectedSeats} onToggle={toggleSeat} zoneStyle={zs} />
                      ))}
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 12, fontSize: 11, color: zs.text }}>
                      <span>{zone.seats.filter((s) => (s.display_status || s.seat_status) === "available").length} available</span>
                      <span>{zone.seats.filter((s) => (s.display_status || s.seat_status) === "booked").length} booked</span>
                      <span style={{ marginLeft: "auto" }}>{zone.seats.length} seats total</span>
                    </div>
                  </div>
                );
              })()}

              {/* Selected summary */}
              {sortedSelected.length > 0 && (
                <div style={{ marginTop: 12, padding: "12px 16px", background: "#f3f0ff", borderRadius: 12, fontSize: 13, color: "#7c3aed", fontWeight: 600, border: "1.5px solid #c4b5fd" }}>
                  Selected: {sortedSelected.map((s) => s.seat_no).join(", ")} · Total: THB {totalPrice.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Booking Form */}
      {selectedSession && (
        <section style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 18px" }}>Booking Info</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["First Name *","firstname","text","e.g. John"],["Last Name *","lastname","text","e.g. Smith"],["Email *","email","email","example@email.com"],["Phone","phone","tel","081-xxx-xxxx"],["Date of Birth","date_of_birth","date",""]].map(([label, field, type, ph]) => (
              <div key={field}>
                <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={ph}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Payment Method</label>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                <option value="qr_code">QR Code / PromptPay</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "12px 0 0" }}>{error}</p>}

          {selectedSeats.length > 0 && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Booking Summary</div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} · {selectedSession.session_name}</span>
                <span style={{ fontWeight: 700, color: "#111" }}>THB {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          <button onClick={handleBook} disabled={submitting || selectedSeats.length === 0}
            style={{ marginTop: 18, width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
              background: submitting || selectedSeats.length === 0 ? "#d1d5db" : "linear-gradient(135deg,#7c3aed,#ec4899)",
              color: "#fff", fontWeight: 700, fontSize: 15, cursor: submitting || selectedSeats.length === 0 ? "not-allowed" : "pointer" }}>
            {submitting ? "Booking..." : selectedSeats.length === 0 ? "Select seats first" : `Book ${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} — THB ${totalPrice.toLocaleString()}`}
          </button>
        </section>
      )}
    </div>
  );
}
