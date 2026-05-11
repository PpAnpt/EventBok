import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { customerApi, organizerPortalApi } from "../../api/index.js";
import { useCustomerAuth } from "../../utils/CustomerAuthContext.jsx";

export default function UserLogin() {
  const [form, setForm] = useState({ email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.phone) { setError("Please enter email and phone number"); return; }
    setLoading(true);
    setError("");
    try {
      // Try organizer first
      try {
        const res = await organizerPortalApi.login(form.email, form.phone);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("organizer_token", res.data.token);
        localStorage.setItem("organizer_info", JSON.stringify(res.data.organizer));
        navigate("/organizer/dashboard");
        return;
      } catch { /* not an organizer — try customer */ }

      // Try customer
      const res = await customerApi.login(form.email, form.phone);
      login(res.data.customer, res.data.token);
      navigate("/user/my-bookings");
    } catch {
      setError("Invalid email or phone number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Sign In</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Use your registered email and phone number</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="081-111-0001"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: loading ? "#d1d5db" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 16, padding: "12px 16px", background: "#f9fafb", borderRadius: 12, fontSize: 12, color: "#6b7280" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#374151" }}>Use the same email + phone number</p>
          <p style={{ margin: 0 }}>Customer — view your tickets</p>
          <p style={{ margin: "2px 0 0" }}>Organizer — view your concert info</p>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#6b7280" }}>
          <p style={{ margin: "0 0 6px" }}>No account? Book a ticket and one will be created automatically.</p>
          <Link to="/user" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>Browse all concerts</Link>
        </div>
      </div>
    </div>
  );
}
