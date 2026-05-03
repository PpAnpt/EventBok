import { useState } from "react";

const mockPayments = [
  { id: "PAY001", customer: "John Smith",    booking: "BK001", concert: "Rock Night 2026",    amount: 700, method: "Credit Card",  txn: "TXN789456123", date: "3/15/2026 02:30 PM", status: "completed" },
  { id: "PAY002", customer: "Sarah Johnson", booking: "BK002", concert: "Jazz Evening",       amount: 200, method: "PayPal",       txn: "TXN789456124", date: "3/16/2026 10:15 AM", status: "completed" },
  { id: "PAY003", customer: "Mike Brown",    booking: "BK003", concert: "Pop Fest",           amount: 240, method: "Debit Card",   txn: "TXN789456125", date: "5/3/2026 01:52 PM",  status: "pending" },
  { id: "PAY004", customer: "Emily Davis",   booking: "BK004", concert: "Classical Symphony", amount: 700, method: "Credit Card",  txn: "TXN789456126", date: "2/28/2026 11:20 AM", status: "completed" },
  { id: "PAY005", customer: "David Wilson",  booking: "BK005", concert: "Rock Night 2026",    amount: 80,  method: "Bank Transfer",txn: "TXN789456127", date: "3/12/2026 09:00 AM", status: "refunded" },
  { id: "PAY006", customer: "Lisa Anderson", booking: "BK006", concert: "Jazz Evening",       amount: 700, method: "Credit Card",  txn: "TXN789456128", date: "3/19/2026 01:10 PM", status: "completed" },
  { id: "PAY007", customer: "Robert Taylor", booking: "BK007", concert: "Pop Fest",           amount: 80,  method: "PayPal",       txn: "TXN789456129", date: "5/3/2026 01:52 PM",  status: "pending" },
];

const statusColor = { completed: { bg: "#dcfce7", color: "#16a34a" }, pending: { bg: "#fef9c3", color: "#a16207" }, refunded: { bg: "#fee2e2", color: "#dc2626" }, failed: { bg: "#fee2e2", color: "#dc2626" } };
const methodIcon = { "Credit Card": "💳", "Debit Card": "💳", "PayPal": "🅿", "Bank Transfer": "🏦", "QR Code": "📱" };

export default function PaymentList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockPayments.filter((p) => {
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.txn.toLowerCase().includes(search.toLowerCase()) ||
      p.concert.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
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
            <input
              placeholder="Search by customer, transaction ID, or concert..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, flex: 1, outline: "none" }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

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
              <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px 14px", color: "var(--color-primary)", fontWeight: 600, fontSize: 13 }}>{p.id}</td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.customer}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>Booking: {p.booking}</div>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{p.concert}</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "#10b981" }}>${p.amount}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    {methodIcon[p.method] || "💰"} {p.method}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--color-text-muted)" }}>{p.txn}</td>
                <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.date}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor[p.status]?.bg, color: statusColor[p.status]?.color }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>👁</button>
                    {p.status === "completed" && <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>↩</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
