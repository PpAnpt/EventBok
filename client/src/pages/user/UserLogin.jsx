import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { customerApi } from "../../api/index.js";
import { useCustomerAuth } from "../../utils/CustomerAuthContext.jsx";

export default function UserLogin() {
  const [form, setForm] = useState({ email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.phone) { setError("กรุณากรอกอีเมลและเบอร์โทร"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await customerApi.login(form.email, form.phone);
      login(res.data.customer, res.data.token);
      navigate("/user/my-bookings");
    } catch {
      setError("อีเมลหรือเบอร์โทรไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px" }}>♪</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>เข้าสู่ระบบ</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>ใช้อีเมลและเบอร์โทรที่ลงทะเบียนไว้</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>อีเมล</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>เบอร์โทรศัพท์</label>
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
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
          <p style={{ margin: "0 0 6px" }}>ยังไม่มีบัญชี? จองตั๋วแล้วระบบจะสร้างให้อัตโนมัติ</p>
          <Link to="/user" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>ดูคอนเสิร์ตทั้งหมด →</Link>
        </div>
      </div>
    </div>
  );
}
