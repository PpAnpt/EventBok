import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { reportsApi } from "../../api/index.js";

const defaultStats = [
  { label: "Total Bookings", value: "-", change: "", icon: "◫", color: "#7c3aed", bg: "#f3f0ff" },
  { label: "Active Concerts", value: "-", change: "", icon: "♪", color: "#ec4899", bg: "#fdf2f8" },
  { label: "Revenue", value: "-", change: "", icon: "$", color: "#10b981", bg: "#ecfdf5" },
  { label: "Total Customers", value: "-", change: "", icon: "👥", color: "#f59e0b", bg: "#fffbeb" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);

  useEffect(() => {
    reportsApi.summary().then((res) => {
      setStats([
        { label: "Total Bookings",  value: res.data.total_bookings.toLocaleString(), icon: "◫", color: "#7c3aed", bg: "#f3f0ff" },
        { label: "Active Concerts", value: res.data.active_concerts.toLocaleString(), icon: "♪", color: "#ec4899", bg: "#fdf2f8" },
        { label: "Revenue",         value: `$${res.data.revenue.toLocaleString()}`, icon: "$", color: "#10b981", bg: "#ecfdf5" },
        { label: "Total Customers", value: res.data.total_customers.toLocaleString(), icon: "👥", color: "#f59e0b", bg: "#fffbeb" },
      ]);
    }).catch(() => {});

    reportsApi.revenue().then((res) => setRevenueData(res.data.data || [])).catch(() => {});
    reportsApi.bookings().then((res) => setBookingData(res.data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin 🔑</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "20px", borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 8px" }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{s.value}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed" }} />
              <span style={{ fontWeight: 600 }}>Revenue Overview</span>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "2px 0 0 18px" }}>Monthly revenue for the last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#67e8f9" }} />
              <span style={{ fontWeight: 600 }}>Bookings Trend</span>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "2px 0 0 18px" }}>Booking trends over the last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#67e8f9" strokeWidth={2} dot={{ r: 4, fill: "#67e8f9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
