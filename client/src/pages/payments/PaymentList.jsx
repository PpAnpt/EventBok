import { useState, useEffect } from "react";
import { paymentsApi } from "../../api/index.js";

const statusColor = { completed: { bg: "#dcfce7", color: "#16a34a" }, pending: { bg: "#fef9c3", color: "#a16207" }, refunded: { bg: "#fee2e2", color: "#dc2626" }, failed: { bg: "#fee2e2", color: "#dc2626" } };
const methodIcon = { "credit_card": "💳", "debit_card": "💳", "qr_code": "📱", "bank_transfer": "🏦" };

function ViewModal({ payment, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700 }}>Payment Detail</h3>
        {[
          ["Payment ID", payment.payment_id],
          ["Customer", `${payment.firstname} ${payment.lastname}`],
          ["Booking", payment.booking_id],
          ["Concert", payment.concert_name],
          ["Amount", `$${payment.total_price}`],
          ["Method", payment.payment_method],
          ["Transaction ID", payment.transaction_id],
          ["Date", payment.payment_date],
          ["Status", payment.payment_status],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
            <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState(null);

  const fetchPayments = async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await paymentsApi.list(params);
      setPayments(res.data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [statusFilter]);

  const filtered = payments.filter((p) => {
    const name = `${p.firstname} ${p.lastname}`.toLowerCase();
    return name.includes(search.toLowerCase()) ||
      p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.concert_name?.toLowerCase().includes(search.toLowerCase());
  });

  const updateStatus = async (id, status) => {
    try { await paymentsApi.updateStatus(id, status); } catch { /* ignore */ }
    setPayments((prev) => prev.map((p) => p.payment_id === id ? { ...p, payment_status: status } : p));
  };

  return (
    <div>
      {viewing && <ViewModal payment={viewing} onClose={() => setViewing(null)} />}

      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Payments</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ fontWeight: 600 }}>Payment Transactions</span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 16px 18px" }}>View and manage all payment records</p>
          <div style={{ display: "flex", gap: 12 }}>
            <input placeholder="Search by customer, transaction ID, or concert..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, flex: 1, outline: "none" }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Payment ID", "Customer", "Concert", "Amount", "Method", "Transaction ID", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.payment_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "12px 14px", color: "var(--color-primary)", fontWeight: 600, fontSize: 13 }}>{p.payment_id}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.firstname} {p.lastname}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>Booking: {p.booking_id}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{p.concert_name}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#10b981" }}>${p.total_price}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      {methodIcon[p.payment_method] || "💰"} {p.payment_method}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--color-text-muted)" }}>{p.transaction_id}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12 }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor[p.payment_status]?.bg, color: statusColor[p.payment_status]?.color }}>{p.payment_status}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewing(p)} title="View" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>👁</button>
                      {p.payment_status === "completed" && <button onClick={() => updateStatus(p.payment_id, "refunded")} title="Refund" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>↩</button>}
                      {p.payment_status === "pending" && <button onClick={() => updateStatus(p.payment_id, "failed")} title="Cancel" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✕</button>}
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
