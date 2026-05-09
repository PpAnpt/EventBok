import { useState, useEffect } from "react";
import { concertsApi, organizersApi, venuesApi } from "../../api/index.js";

const statusColor = { upcoming: { bg: "#e0e7ff", color: "#4338ca" }, completed: { bg: "#dcfce7", color: "#16a34a" }, cancelled: { bg: "#fee2e2", color: "#dc2626" }, ongoing: { bg: "#fef9c3", color: "#a16207" } };
const genreColor = { Rock: "#f3f0ff", Jazz: "#fdf2f8", Pop: "#fce7f3", Classical: "#ecfdf5" };
const emptySession = { session_name: "", show_date: "", start_time: "", end_time: "" };

function ViewModal({ concert, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>Concert Detail</h3>
        {[["Concert ID", concert.concert_id], ["Concert Name", concert.concert_name], ["Artist", concert.artist_name], ["Organizer", concert.organizer_name], ["Venue", concert.venue_name], ["Status", concert.status]].map(([label, value]) => (
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

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ concert_name: "", artist_name: "", description: "", cover_url: "", organizer_id: "", venue_id: "", status: "upcoming" });
  const [sessions, setSessions] = useState([{ ...emptySession }]);
  const [organizers, setOrganizers] = useState([]);
  const [venues, setVenues] = useState([]);
  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" };

  useEffect(() => {
    organizersApi.list().then((r) => setOrganizers(r.data)).catch(() => {});
    venuesApi.list().then((r) => setVenues(r.data)).catch(() => {});
  }, []);

  const addSession = () => setSessions((p) => [...p, { ...emptySession }]);
  const removeSession = (idx) => setSessions((p) => p.filter((_, i) => i !== idx));
  const updateSession = (idx, field, value) => setSessions((p) => p.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const handleSave = async () => {
    if (!form.concert_name || !form.organizer_id || !form.venue_id) return;
    try {
      await concertsApi.create({ ...form, sessions });
      onAdd();
    } catch {
      onAdd();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
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
              {["upcoming", "ongoing", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
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
            <select value={form.venue_id} onChange={(e) => setForm({ ...form, venue_id: e.target.value })} style={inputStyle}>
              <option value="">Select venue</option>
              {venues.map((v) => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Cover Image URL (ปก)</label>
            <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} style={inputStyle} placeholder="https://example.com/cover.jpg" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Concert description..." />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 10px" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Sessions</p>
          <button onClick={addSession} style={{ padding: "4px 12px", borderRadius: 8, border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", background: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Add Session</button>
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
                <input value={s.session_name} onChange={(e) => updateSession(idx, "session_name", e.target.value)} style={inputStyle} placeholder="e.g. Night 1" />
              </div>
              {[["Date", "show_date", "date"], ["Start Time", "start_time", "time"], ["End Time", "end_time", "time"]].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 3 }}>{label}</label>
                  <input type={type} value={s[field]} onChange={(e) => updateSession(idx, field, e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "var(--gradient-brand)", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Add Concert</button>
        </div>
      </div>
    </div>
  );
}

export default function ConcertList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const fetchConcerts = async () => {
    try {
      const res = await concertsApi.list();
      setConcerts(res.data);
    } catch {
      setConcerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConcerts(); }, []);

  const filtered = concerts.filter((c) =>
    c.concert_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.organizer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.venue_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (updatedSessions) => {
    try { await concertsApi.update(editing.concert_id, { ...editing, sessions: updatedSessions }); }
    catch { /* fallback: update local */ }
    setConcerts((prev) => prev.map((c) => c.concert_id === editing.concert_id ? { ...c, sessions: updatedSessions } : c));
    setEditing(null);
  };

  const deleteConcert = async (id) => {
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
          <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin 🔑</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "var(--gradient-brand)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + Add Concert
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ec4899" }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>All Concerts</span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 16px 18px" }}>View and manage concert listings</p>
          <input placeholder="Search concerts, organizers, or venues..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, width: 340, outline: "none" }} />
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["ID", "Concert Name", "Organizer", "Sessions", "Venue", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.concert_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>{c.concert_id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: genreColor[c.genre] || "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>♪</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.concert_name}</div>
                        <span style={{ fontSize: 11, background: genreColor[c.genre] || "#f3f0ff", padding: "2px 8px", borderRadius: 20, color: "#6b7280" }}>{c.genre || c.artist_name}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{c.organizer_name}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {(c.sessions || []).map((s, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                          {s.session_name} · {s.show_date} {s.start_time}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>📍 {c.venue_name}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor[c.status]?.bg, color: statusColor[c.status]?.color }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setViewing(c)} title="View" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>👁</button>
                      <button onClick={() => setEditing(c)} title="Edit sessions" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>✏</button>
                      <button onClick={() => deleteConcert(c.concert_id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>🗑</button>
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
