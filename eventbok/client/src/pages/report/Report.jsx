import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 18000 }, { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 24000 }, { month: "May", revenue: 22000 }, { month: "Jun", revenue: 30000 },
];

const bookingCustomerData = [
  { month: "Jan", bookings: 150, customers: 120 }, { month: "Feb", bookings: 175, customers: 160 },
  { month: "Mar", bookings: 165, customers: 155 }, { month: "Apr", bookings: 230, customers: 220 },
  { month: "May", bookings: 215, customers: 210 }, { month: "Jun", bookings: 295, customers: 290 },
];

const venueData = [
  { venue: "Grand Arena", revenue: 28000 }, { venue: "City Stadium", revenue: 18000 },
  { venue: "Concert Hall", revenue: 12000 }, { venue: "Blue Note Hall", revenue: 7000 },
];

export default function Report() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Report</h1>
      <p style={{ color: "var(--color-text-muted)", margin: "0 0 24px", fontSize: 14 }}>Welcome back, Admin 🔑</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Monthly revenue over the selected period</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
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
          <p style={{ fontWeight: 600, margin: "0 0 2px" }}>Bookings and new customers comparison</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={bookingCustomerData}>
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

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#67e8f9" }} />
          <span style={{ fontWeight: 600 }}>Venue Performance</span>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: "-8px 0 16px 18px" }}>Top performing venues by revenue</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={venueData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="venue" type="category" tick={{ fontSize: 12 }} width={100} />
            <Tooltip />
            <Bar dataKey="revenue" fill="url(#venueGrad)" radius={[0,4,4,0]}>
              <defs>
                <linearGradient id="venueGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
