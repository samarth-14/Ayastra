import { motion } from "motion/react";
import { TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const REV_12M = [
  { m: "Jul", r: 42, p: 8 }, { m: "Aug", r: 48, p: 10 }, { m: "Sep", r: 45, p: 9 },
  { m: "Oct", r: 54, p: 13 }, { m: "Nov", r: 61, p: 16 }, { m: "Dec", r: 58, p: 15 },
  { m: "Jan", r: 67, p: 19 }, { m: "Feb", r: 72, p: 21 }, { m: "Mar", r: 78, p: 24 },
  { m: "Apr", r: 84, p: 27 }, { m: "May", r: 91, p: 29 }, { m: "Jun", r: 98, p: 32 },
];

const CUSTOMERS = [
  { m: "Jan", n: 240 }, { m: "Feb", n: 252 }, { m: "Mar", n: 261 }, { m: "Apr", n: 270 },
  { m: "May", n: 278 }, { m: "Jun", n: 284 },
];

const CATEGORY_REV = [
  { cat: "Steel", val: 48 }, { cat: "Copper", val: 22 }, { cat: "Aluminium", val: 16 }, { cat: "Zinc", val: 9 }, { cat: "Others", val: 5 },
];

const KPIS = [
  { label: "FY Revenue", value: "₹7.98Cr", delta: "+18% YoY", color: "#F59E0B", icon: <DollarSign size={16} /> },
  { label: "Net Margin", value: "32.6%", delta: "+2.4pp", color: "#22C55E", icon: <TrendingUp size={16} /> },
  { label: "Active Customers", value: "284", delta: "+18 MoM", color: "#3B82F6", icon: <Users size={16} /> },
  { label: "EBITDA", value: "₹2.31Cr", delta: "+22% YoY", color: "#8B5CF6", icon: <BarChart3 size={16} /> },
];

const HEALTH = [
  { label: "Revenue Growth", val: 88, color: "#22C55E" },
  { label: "Margin Health", val: 74, color: "#F59E0B" },
  { label: "Customer Retention", val: 92, color: "#22C55E" },
  { label: "Inventory Efficiency", val: 67, color: "#F59E0B" },
  { label: "Collections", val: 58, color: "#EF4444" },
];

export function DashboardAnalytics() {
  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Business Analytics</h2>
        <p style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif" }}>FY 2025–26 · Updated live</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
            style={{ background: "rgba(11,17,32,0.9)", border: `1px solid ${k.color}20`, borderRadius: 14, padding: "1rem 1.1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginBottom: 5 }}>{k.label}</div>
                <div style={{ color: k.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.35rem" }}>{k.value}</div>
                <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{k.delta}</div>
              </div>
              <div style={{ color: k.color, background: `${k.color}15`, borderRadius: 8, padding: "0.4rem", alignSelf: "flex-start" }}>{k.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Revenue & Profit (₹L)</span>
            <span style={{ color: "#22C55E", fontSize: "0.7rem", fontFamily: "'JetBrains Mono',monospace" }}>+18% FY YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={REV_12M} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="m" tick={{ fill: "#4B5563", fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="r" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="p" stroke="#22C55E" strokeWidth={2} dot={false} strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 14, height: 2, background: "#8B5CF6" }} /><span style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif" }}>Revenue</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 14, height: 2, background: "#22C55E" }} /><span style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif" }}>Profit</span></div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem", flex: 1 }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem", fontSize: "0.88rem" }}>Customer Growth</div>
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={CUSTOMERS} margin={{ top: 2, right: 5, bottom: 2, left: -20 }}>
                <XAxis dataKey="m" tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Line type="monotone" dataKey="n" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem", flex: 1 }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem", fontSize: "0.88rem" }}>Category Revenue %</div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={CATEGORY_REV} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: -5 }}>
                <XAxis type="number" tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="cat" type="category" tick={{ fill: "#8892a4", fontSize: 9 }} axisLine={false} tickLine={false} width={45} />
                <Bar dataKey="val" fill="#F59E0B" fillOpacity={0.75} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Health */}
      <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 16, padding: "1.25rem" }}>
        <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Business Health Score</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.75rem" }}>
          {HEALTH.map((h) => (
            <div key={h.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>{h.label}</span>
                <span style={{ color: h.color, fontSize: "0.7rem", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{h.val}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${h.val}%` }} transition={{ duration: 1.1, ease: "easeOut" }}
                  style={{ height: "100%", background: h.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
