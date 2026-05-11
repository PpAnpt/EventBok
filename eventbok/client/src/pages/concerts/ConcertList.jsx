import { useState, useEffect } from "react";
import { concertsApi, organizersApi, venuesApi } from "../../api/index.js";

const statusColor = {
  upcoming:  { bg: "#e0e7ff", color: "#4338ca" },
  completed: { bg: "#dcfce7", color: "#16a34a" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
  ongoing:   { bg: "#fef9c3", color: "#a16207" },
};

const TEMPLATE_LABELS = { 500: "Small Venue (500 seats)", 2000: "Concert Hall (2000 seats)", 5000: "Arena (5000 seats)" };

const ZONE_BADGE = {
  vip:     { bg: "#f3f0ff", color: "#7c3aed" },
  premium: { bg: "#fdf2f8", color: "#ec4899" },
  regular: { bg: "#f0fdf4", color: "#16a34a" },
};

const emptySession = { session_name: "", show_date: "", start_time: "", end_time: "" };

// ─── ViewModal ────────────────────────────────────────────────────────────────
function ViewModal({ concert, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>Concert Detail</h3>
        {[
          ["Concert ID", concert.concert_id],
          ["Concert Name", concert.concert_name],
          ["Artist", concert.artist_name],
          ["Organizer", concert.organizer_name],
          ["Venue", concert.venue_name],
          ["Seating", TEMPLATE_LABELS[concert.capacity_template] || (concert.capacity_template ? `${concert.capacity_template} seats` : "—")],
          ["Status", concert.status],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
            <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        {concert.sessions?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 10px" }}>Sessions</p>
            {concert.sessions.map((s, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: "#7c3aed" }}>{s.session_name}</span>
                <span style={{ color: "#6b7280", marginLeft: 10 }}>{s.show_date} · {s.start_time} – {s.end_time}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── EditModal ────────────────────────────────────────────────────────────────
function EditModal({ concert, onClose, onSave }) {
  const [sessions, setSessions] = useState((concert.sessions || []).map((s) => ({ ...s })));
  const updateSession = (idx, field, value) => setSessions((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 540, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>Edit Sessions</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>{concert.concert_name}</p>
        {sessions.map((s, idx) => (
          <div key={idx} style={{ background: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 13, color: "#7c3aed" }}>Session {idx + 1} — {s.session_name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Date", "show_date", "date"], ["Start Time", "start_time", "time"], ["End Time", "end_time", "time"]].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>{label}</label>
                  <input type={type} value={s[field]} onChange={(e) => updateSession(idx, field, e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={() => onSave(sessions)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "var(--gradient-brand)", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── AddModal ─────────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    concert_name: "", artist_name: "", description: "",
    cover_url: "", organizer_id: "", venue_id: "", status: "upcoming",
  });
  const [venueZones, setVenueZones] = useState([]);   // zones for selected venue
  const [zonePrices, setZonePrices] = useState({});   // { zone_id: price }
  const [sessions, setSessions] = useState([{ ...emptySession }]);
  const [organizers, setOrganizers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [saving, setSaving] = useState(false);

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" };

  useEffect(() => {
    organizersApi.list().then((r) => setOrganizers(r.data || [])).catch(() => {});
    venuesApi.list().then((r) => setVenues(r.data || [])).catch(() => {});
  }, []);

  const handleVenueChange = (venueId) => {
    setForm((f) => ({ ...f, venue_id: venueId }));
    setVenueZones([]);
    setZonePrices({});
    if (!venueId) return;
    venuesApi.getZones(venueId).then((res) => {
      const zones = res.data || [];
      setVenueZones(zones);
      const defaults = {};
      zones.forEach((z) => { defaults[z.zone_id] = z.price; });
      setZonePrices(defaults);
    }).catch(() => {});
  };

  const addSession = () => setSessions((p) => [...p, { ...emptySession }]);
  const removeSession = (idx) => setSessions((p) => p.filter((_, i) => i !== idx));
  const updateSession = (idx, field, value) => setSessions((p) => p.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const handleSave = async () => {
    if (!form.concert_name || !form.organizer_id || !form.venue_id) {
      alert("Please fill in all required fields: name, organizer, and venue");
      return;
    }
    const validSessions = sessions.filter((s) => s.show_date && s.start_time);
    if (validSessions.length === 0) {
      alert("Please add at least 1 session (with date and start time)");
      return;
    }
    setSaving(true);
    try {
      await concertsApi.create({ ...form, sessions: validSessions, zone_prices: zonePrices });
      onAdd();
    } catch (err) {
      alert("Error: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>Add Concert</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Concert Name *</label>
            <input value={form.concert_name} onChange={(e) => setForm({ ...form, concert_name: e.target.value })} style={inputStyle} placeholder="e.g. Summer Fest 2026" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Artist Name</label>
            <input value={form.artist_name} onChange={(e) => setForm({ ...form, artist_name: e.target.value })} style={inputStyle} placeholder="e.g. The Rockers" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              {["upcoming","ongoing","completed","cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Organizer *</label>
            <select value={form.organizer_id} onChange={(e) => setForm({ ...form, organizer_id: e.target.value })} style={inputStyle}>
              <option value="">Select organizer</option>
              {organizers.map((o) => <option key={o.organizer_id} value={o.organizer_id}>{o.organizer_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Venue *</label>
            <select value={form.venue_id} onChange={(e) => handleVenueChange(e.target.value)} style={inputStyle}>
              <option value="">Select venue</option>
              {venues.map((v) => (
                <option key={v.venue_id} value={v.venue_id}>
                  {v.venue_name} · {TEMPLATE_LABELS[v.capacity_template] || `${v.capacity_template} seats`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Cover Image URL</label>
            <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} style={inputStyle} placeholder="https://example.com/cover.jpg" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Concert description..." />
          </div>
        </div>

        {/* ── Zone Prices ── */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, marginBottom: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>Zone Prices</p>
          {!form.venue_id ? (
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Select a venue to view zones and set prices</p>
          ) : venueZones.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Loading zones...</p>
          ) : (
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>Set price per zone</p>
              {venueZones.map((zone) => {
                const badge = ZONE_BADGE[zone.type] || ZONE_BADGE.regular;
                return (
                  <div key={zone.zone_id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ minWidth: 140, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: badge.bg, color: badge.color }}>{zone.zone_name}</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>THB</span>
                      <input type="number" min="0" step="100"
                        value={zonePrices[zone.zone_id] ?? ""}
                        onChange={(e) => setZonePrices((prev) => ({ ...prev, [zone.zone_id]: e.target.value }))}
                        style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none" }} />
                      <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>/ seat</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sessions ── */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>Sessions</p>
            <button onClick={addSession} style={{ padding: "4px 12px", borderRadius: 8, border: "1.5px solid #7c3aed", color: "#7c3aed", background: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Add Session</button>
          </div>
          {sessions.map((s, idx) => (
            <div key={idx} style={{ background: "#f9fafb", borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: "#7c3aed" }}>Session {idx + 1}</span>
                {sessions.length > 1 && <button onClick={() => removeSession(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13 }}>✕</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 3 }}>Session Name</label>
                  <input value={s.session_name} onChange={(e) => updateSession(idx, "session_name", e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    placeholder="e.g. Night 1" />
                </div>
                {[["Date", "show_date", "date"], ["Start Time", "start_time", "time"], ["End Time", "end_time", "time"]].map(([label, field, type]) => (
                  <div key={field}>
                    <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 3 }}>{label}</label>
                    <input type={type} value={s[field]} onChange={(e) => updateSession(idx, field, e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: saving ? "#d1d5db" : "var(--gradient-brand)", color: "#fff", fontSize: 13, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
            {saving ? "Creating..." : "Add Concert"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ConcertList ──────────────────────────────────────────────────────────────
export default function ConcertList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const fetchConcerts = async () => {
    try { const res = await concertsApi.list(); setConcerts(res.data); }
    catch { setConcerts([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchConcerts(); }, []);

  const filtered = concerts.filter((c) =>
    c.concert_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.organizer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.venue_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (updatedSessions) => {
    try { await concertsApi.update(editing.concert_id, { ...editing, sessions: updatedSessions }); }
    catch { /* fallback */ }
    setConcerts((prev) => prev.map((c) => c.concert_id === editing.concert_id ? { ...c, sessions: updatedSessions } : c));
    setEditing(null);
  };

  const deleteConcert = async (id) => {
    if (!window.confirm("Delete this concert?")) return;
    try { await concertsApi.delete(id); } catch { /* ignore */ }
    setConcerts((prev) => prev.filter((c) => c.concert_id !== id));
  };

  return (
    <div>
      {adding && <AddModal onClose={() => setAdding(false)} onAdd={() => { setAdding(false); fetchConcerts(); }} />}
      {viewing && <ViewModal concert={viewing} onClose={() => setViewing(null)} />}
      {editing && <EditModal concert={editing} onClose={() => setEditing(null)} onSave={handleSave} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Concerts</h1>
          <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "var(--gradient-brand)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + Add Concert
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px" }}>All Concerts</p>
          <input placeholder="Search concerts, organizers, or venues..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, width: 340, outline: "none" }} />
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>No concerts found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["ID","Concert","Organizer","Sessions","Venue","Layout","Status","Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.concert_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>{c.concert_id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.concert_name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.artist_name}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.organizer_name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {(c.sessions || []).map((s, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                          {s.session_name} · {s.show_date}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.venue_name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, background: "#f3f0ff", color: "#7c3aed", padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>
                      {TEMPLATE_LABELS[c.capacity_template] || (c.capacity_template ? `${c.capacity_template}` : "—")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusColor[c.status]?.bg, color: statusColor[c.status]?.color }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewing(c)} title="View" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: 4, color: "#6b7280", fontWeight: 600 }}>View</button>
                      <button onClick={() => setEditing(c)} title="Edit sessions" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: 4, color: "#7c3aed", fontWeight: 600 }}>Edit</button>
                      <button onClick={() => deleteConcert(c.concert_id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: 4, color: "#dc2626", fontWeight: 600 }}>Delete</button>
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
