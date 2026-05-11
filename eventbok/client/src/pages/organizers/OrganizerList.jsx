import { useState, useEffect } from "react";
import { organizersApi } from "../../api/index.js";

function OrganizerModal({ organizer, onClose, onSave }) {
  const [form, setForm] = useState(
    organizer
      ? { organizer_name: organizer.organizer_name, contact_email: organizer.contact_email, phone_number: organizer.phone_number }
      : { organizer_name: "", contact_email: "", phone_number: "" }
  );
  const [saving, setSaving] = useState(false);
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" };

  const handleSave = async () => {
    if (!form.organizer_name || !form.contact_email) return;
    setSaving(true);
    try {
      if (organizer) await organizersApi.update(organizer.organizer_id, form);
      else await organizersApi.create(form);
      onSave();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>{organizer ? "Edit Organizer" : "Add Organizer"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Organizer Name *", "organizer_name", "text", "e.g. The Rockers Ent."], ["Contact Email *", "contact_email", "email", "contact@example.com"], ["Phone Number", "phone_number", "tel", "081-000-0000"]].map(([label, field, type, ph]) => (
            <div key={field}>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5 }}>{label}</label>
              <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={ph} style={inputStyle} />
            </div>
          ))}
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

export default function OrganizerList() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => {
    setLoading(true);
    organizersApi.list().then((r) => setOrganizers(r.data || [])).catch(() => setOrganizers([])).finally(() => setLoading(false));
  };

  const deleteOrganizer = async (id) => {
    if (!window.confirm("Delete this organizer and all their concerts?")) return;
    try {
      await organizersApi.delete(id);
      setOrganizers((prev) => prev.filter((o) => o.organizer_id !== id));
    } catch { alert("Failed to delete organizer."); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div>
      {adding && <OrganizerModal onClose={() => setAdding(false)} onSave={() => { setAdding(false); fetch(); }} />}
      {editing && <OrganizerModal organizer={editing} onClose={() => setEditing(null)} onSave={() => { setEditing(null); fetch(); }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Organizers</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14, margin: 0 }}>Manage concert organizers</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding: "9px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + Add Organizer
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["ID", "Organizer Name", "Email", "Phone", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {organizers.map((o) => (
                <tr key={o.organizer_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>{o.organizer_id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{o.organizer_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-text-muted)" }}>{o.contact_email}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{o.phone_number}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditing(o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>Edit</button>
                      <button onClick={() => deleteOrganizer(o.organizer_id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Delete</button>
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
