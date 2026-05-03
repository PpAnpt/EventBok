import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@eventbok.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #dbeafe 100%)"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px",
        width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(124,58,237,0.12)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: "linear-gradient(135deg, #fde68a 0%, #f9a8d4 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, margin: "0 auto 12px"
          }}>🐻</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)", margin: 0 }}>EventBok</h1>
          <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>
            Sign in to your admin dashboard 🎵
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid var(--color-border)", fontSize: 14,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid var(--color-border)", fontSize: 14,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: "var(--gradient-brand)", color: "#fff",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Sign In to EventBok 🔑"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 12, marginTop: 16 }}>
          Demo: Use any email and password to login
        </p>
      </div>
    </div>
  );
}
