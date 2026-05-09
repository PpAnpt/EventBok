import { useState } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const allData = {
  "3": {
    revenue: [{ month: "Apr", revenue: 24000 }, { month: "May", revenue: 22000 }, { month: "Jun", revenue: 30000 }],
    bookingCustomer: [{ month: "Apr", bookings: 230, customers: 220 }, { month: "May", bookings: 215, customers: 210 }, { month: "Jun", bookings: 295, customers: 290 }],
  },
  "6": {
    revenue: [{ month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 18000 }, { month: "Mar", revenue: 15000 }, { month: "Apr", revenue: 24000 }, { month: "May", revenue: 22000 }, { month: "Jun", revenue: 30000 }],
    bookingCustomer: [{ month: "Jan", bookings: 150, customers: 120 }, { month: "Feb", bookings: 175, customers: 160 }, { month: "Mar", bookings: 165, customers: 155 }, { month: "Apr", bookings: 230, customers: 220 }, { month: "May", bookings: 215, customers: 210 }, { month: "Jun", bookings: 295, customers: 290 }],
  },
  "12": {
    revenue: [{ month: "Jul", revenue: 9000 }, { month: "Aug", revenue: 11000 }, { month: "Sep", revenue: 13000 }, { month: "Oct", revenue: 10000 }, { month: "Nov", revenue: 14000 }, { month: "Dec", revenue: 16000 }, { month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 18000 }, { month: "Mar", revenue: 15000 }, { month: "Apr", revenue: 24000 }, { month: "May", revenue: 22000 }, { month: "Jun", revenue: 30000 }],
    bookingCustomer: [{ month: "Jul", bookings: 90, customers: 80 }, { month: "Aug", bookings: 110, customers: 100 }, { month: "Sep", bookings: 130, customers: 120 }, { month: "Oct", bookings: 100, customers: 90 }, { month: "Nov", bookings: 140, customers: 130 }, { month: "Dec", bookings: 160, customers: 150 }, { month: "Jan", bookings: 150, customers: 120 }, { month: "Feb", bookings: 175, customers: 160 }, { month: "Mar", bookings: 165, customers: 155 }, { month: "Apr", bookings: 230, customers: 220 }, { month: "May", bookings: 215, customers: 210 }, { month: "Jun", bookings: 295, customers: 290 }],
  },
};

const venueData = [
  { venue: "Grand Arena", revenue: 28000 },
  { venue: "City Stadium", revenue: 18000 },
  { venue: "Concert Hall", revenue: 12000 },
  { venue: "Blue Note Hall", revenue: 7000 },
];

const topConcerts = [
  { rank: 1, name: "Pop Fest",          organizer: "StarStage Productions", venue: "City Stadium",  sessions: 3, bookings: 423, revenue: 33840, occupancy: 78 },
  { rank: 2, name: "Rock Night 2026",   organizer: "The Rockers Ent.",      venue: "Grand Arena",   sessions: 2, bookings: 312, revenue: 218400, occupancy: 69 },
  { rank: 3, name: "Classical Symphony",organizer: "National Orchestra",    venue: "Concert Hall",  sessions: 1, bookings: 290, revenue: 101500, occupancy: 100 },
  { rank: 4, name: "Jazz Evening",      organizer: "Smooth Quartet Co.",    venue: "Blue Note Hall",sessions: 1, bookings: 209, revenue: 41800, occupancy: 81 },
];

function exportCSV(data, filename) {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Report() {
  const [period, setPeriod] = useState("6");
  const { revenue, bookingCustomer } = allData[period];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Report</h1>
          <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", fontSize: 14 }}>Welcome back, Admin 🔑</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", fontSize: 13, outline: "none" }}>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>
          <button
            onClick={() => exportCSV(revenue, "revenue_report.csv")}
            style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--gradient-brand)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            ↓ Export
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Revenue Trend</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 16px" }}>Monthly revenue over the selected period</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#a78bfa" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Bookings & Customer Growth</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 16px" }}>Bookings and new customers comparison</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={bookingCustomer}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: "#34d399" }} />
              <Line type="monotone" dataKey="customers" stroke="#6ee7b7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: "#6ee7b7" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#67e8f9" }} />
          <span style={{ fontWeight: 600 }}>Venue Performance</span>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "0 0 16px 18px" }}>Top performing venues by revenue</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={venueData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="venue" type="category" tick={{ fontSize: 12 }} width={100} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#a78bfa" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ fontWeight: 600 }}>Top Concerts Performance</span>
          </div>
          <button
            onClick={() => exportCSV(topConcerts, "top_concerts.csv")}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--color-border)", background: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            ↓ Export
          </button>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "-8px 0 16px" }}>Ranked concerts by revenue and bookings</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["#", "Concert", "Organizer", "Venue", "Sessions", "Bookings", "Revenue", "Occupancy"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topConcerts.map((c) => (
              <tr key={c.rank} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: c.rank === 1 ? "#f59e0b" : c.rank === 2 ? "#9ca3af" : c.rank === 3 ? "#b45309" : "#6b7280" }}>{c.rank}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: 13 }}>{c.name}</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>{c.organizer}</td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{c.venue}</td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{c.sessions}</td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{c.bookings}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10b981" }}>${c.revenue.toLocaleString()}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3 }}>
                      <div style={{ width: `${c.occupancy}%`, height: "100%", background: c.occupancy >= 90 ? "#10b981" : c.occupancy >= 70 ? "#f59e0b" : "#a78bfa", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{c.occupancy}%</span>
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
