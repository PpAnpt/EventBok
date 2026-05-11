import { useState, useEffect } from "react";
import { venuesApi } from "../../api/index.js";

const TEMPLATES = [
  { value: 500,  label: "Small Venue",   desc: "500 seats (3 zones)" },
  { value: 2000, label: "Concert Hall",  desc: "2000 seats (4 zones)" },
  { value: 5000, label: "Arena Stadium", desc: "5000 seats (5 zones)" },
];

function VenueModal({ venue, onClose, onSave }) {
  const [form, setForm] = useState(
    venue
      ? { venue_name: venue.venue_name, location: venue.location }
      : { venue_name: "", location: "", capacity_template: 500 }
  );
  const [saving, setSaving] = useState(false);
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" };

  const handleTemplateSelect = (value) => {
    setForm((f) => ({ ...f, capacity_template: value, capacity: value }));
  };

  const handleSave = async () => {
    if (!form.venue_name || !form.location) return;
    const payload = venue
      ? { venue_name: form.venue_name, location: form.location, capacity: venue.capacity }
      : { ...form, capacity: form.capacity_template };
    setSaving(true);
    try {
      if (venue) await venuesApi.update(venue.venue_id, payload);
      else await venuesApi.create(payload);
      onSave();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>{venue ? "Edit Venue" : "Add Venue"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Venue Name *", "venue_name", "e.g. Grand Arena"], ["Location *", "location", "e.g. Bangkok, Thailand"]].map(([label, field, ph]) => (
            <div key={field}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5 }}>{label}</label>
              <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={ph} style={inputStyle} />
            </div>
          ))}
          {!venue && (
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 8 }}>Seating Layout *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {TEMPLATES.map((t) => (
                  <button key={t.value} type="button" onClick={() => handleTemplateSelect(t.value)}
                    style={{ flex: 1, padding: "12px 6px", borderRadius: 10, border: `2px solid ${form.capacity_template === t.value ? "#7c3aed" : "#e5e7eb"}`,
                      background: form.capacity_template === t.value ? "#f3f0ff" : "#fff", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: form.capacity_template === t.value ? "#7c3aed" : "#374151" }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0" }}>Seating layout and seat count will be generated automatically based on the selected template.</p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VenueList() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => {
    setLoading(true);
    venuesApi.list().then((r) => setVenues(r.data || [])).catch(() => setVenues([])).finally(() => setLoading(false));
  };

  const deleteVenue = async (id) => {
    if (!window.confirm("Delete this venue and all its concerts, sessions, and seats?")) return;
    try {
      await venuesApi.delete(id);
      setVenues((prev) => prev.filter((v) => v.venue_id !== id));
    } catch { alert("Failed to delete venue."); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div>
      {adding && <VenueModal onClose={() => setAdding(false)} onSave={() => { setAdding(false); fetch(); }} />}
      {editing && <VenueModal venue={editing} onClose={() => setEditing(null)} onSave={() => { setEditing(null); fetch(); }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Venues</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14, margin: 0 }}>Manage concert venues</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding: "9px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + Add Venue
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["ID", "Venue Name", "Location", "Capacity", "Layout", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.venue_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>{v.venue_id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{v.venue_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-text-muted)" }}>{v.location}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{Number(v.capacity).toLocaleString()} seats</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, background: "#f3f0ff", color: "#7c3aed", padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>
                      {TEMPLATES.find((t) => t.value === v.capacity_template)?.label || v.capacity_template}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditing(v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>Edit</button>
                      <button onClick={() => deleteVenue(v.venue_id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Delete</button>
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
