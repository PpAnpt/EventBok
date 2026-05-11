import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { reportsApi } from "../../api/index.js";

const StatIcon = ({ name, color }) => {
  const s = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "bookings")  return <svg {...s}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>;
  if (name === "concerts")  return <svg {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
  if (name === "revenue")   return <svg {...s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
  if (name === "customers") return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  return null;
};

const defaultStats = [
  { label: "Total Bookings",  value: "-", icon: "bookings",  color: "#7c3aed", bg: "#f3f0ff" },
  { label: "Active Concerts", value: "-", icon: "concerts",  color: "#ec4899", bg: "#fdf2f8" },
  { label: "Revenue",         value: "-", icon: "revenue",   color: "#10b981", bg: "#ecfdf5" },
  { label: "Total Customers", value: "-", icon: "customers", color: "#f59e0b", bg: "#fffbeb" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);

  useEffect(() => {
    reportsApi.summary().then((res) => {
      setStats([
        { label: "Total Bookings",  value: res.data.total_bookings.toLocaleString(),       icon: "bookings",  color: "#7c3aed", bg: "#f3f0ff" },
        { label: "Active Concerts", value: res.data.active_concerts.toLocaleString(),      icon: "concerts",  color: "#ec4899", bg: "#fdf2f8" },
        { label: "Revenue",         value: `$${res.data.revenue.toLocaleString()}`,        icon: "revenue",   color: "#10b981", bg: "#ecfdf5" },
        { label: "Total Customers", value: res.data.total_customers.toLocaleString(),      icon: "customers", color: "#f59e0b", bg: "#fffbeb" },
      ]);
    }).catch(() => {});

    reportsApi.revenue().then((res) => setRevenueData(res.data.data || [])).catch(() => {});
    reportsApi.bookings().then((res) => setBookingData(res.data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "20px", borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "var(--color-text-muted)", fontSize: 13, margin: "0 0 8px" }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{s.value}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><StatIcon name={s.icon} color={s.color} /></div>
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
