import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { organizerPortalApi } from "../../api/index.js";
import { useOrganizerAuth } from "../../utils/OrganizerAuthContext.jsx";

export default function OrganizerLogin() {
  const [form, setForm] = useState({ email: "", phone_number: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useOrganizerAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.phone_number) { setError("Please enter email and phone number"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await organizerPortalApi.login(form.email, form.phone_number);
      login(res.data.organizer, res.data.token);
      navigate("/organizer/dashboard");
    } catch {
      setError("Invalid email or phone number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f3f0ff 0%,#fdf2f8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(124,58,237,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Organizer Portal</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Sign in with your company email and phone</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Contact Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@yourcompany.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Phone Number</label>
            <input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="081-000-0001"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: loading ? "#d1d5db" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, fontSize: 12, color: "#6b7280" }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: "#374151" }}>Demo Credentials:</div>
          <div>contact@therockers.com · 081-000-0001</div>
          <div>hello@smoothquartet.com · 081-000-0002</div>
        </div>
      </div>
    </div>
  );
}
