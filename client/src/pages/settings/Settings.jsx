import { useState } from "react";

export default function Settings() {
  const [form, setForm] = useState({ firstName: "Admin", lastName: "User", email: "admin@eventbok.com", phone: "+1 (555) 123-4567", bio: "" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Settings</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", maxWidth: 700, borderTop: "3px solid var(--color-primary)" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Profile Information</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 24px" }}>Update your personal information and profile details</p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
          }}>🐾</div>
          <button style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", background: "transparent", fontWeight: 600, cursor: "pointer" }}>
            Change Avatar
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[["First Name", "firstName"], ["Last Name", "lastName"], ["Email", "email"], ["Phone", "phone"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
              <input
                value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Bio</label>
          <textarea
            value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={4}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", background: "#f9fafb" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSave} style={{
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: saved ? "#10b981" : "var(--gradient-brand)", color: "#fff",
            fontWeight: 600, cursor: "pointer", transition: "background 0.3s"
          }}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
