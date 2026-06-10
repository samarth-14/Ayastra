import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Package, ShoppingCart, TrendingUp, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const REV_DATA = [
  { d: "Mon", v: 38 }, { d: "Tue", v: 52 }, { d: "Wed", v: 47 }, { d: "Thu", v: 61 }, { d: "Fri", v: 78 }, { d: "Sat", v: 65 }, { d: "Sun", v: 42 },
];

const ALERTS = [
  { type: "warn", msg: "Zinc Ingot stock critically low — 44MT remaining", time: "2m ago" },
  { type: "ok", msg: "WhatsApp order SO-2024-8821 confirmed and dispatched", time: "8m ago" },
  { type: "warn", msg: "Copper prices up 1.4% — margin impact on 3 open orders", time: "15m ago" },
  { type: "ok", msg: "Delhi North warehouse restocked: +800MT Steel Billets", time: "1h ago" },
];

const QUICK_STATS = [
  { label: "Today's Revenue", value: "₹12.4L", delta: "+8.2%", color: "#F59E0B", icon: <TrendingUp size={16} /> },
  { label: "Open Orders", value: "34", delta: "+5 new", color: "#3B82F6", icon: <ShoppingCart size={16} /> },
  { label: "Low Stock SKUs", value: "18", delta: "Action needed", color: "#EF4444", icon: <AlertTriangle size={16} /> },
  { label: "Dispatched Today", value: "9", delta: "₹8.1L value", color: "#22C55E", icon: <CheckCircle size={16} /> },
];

const MODULES = [
  { label: "Inventory", path: "/dashboard/inventory", icon: <Package size={20} />, color: "#F59E0B", desc: "2,847 SKUs · 4 warehouses" },
  { label: "Orders", path: "/dashboard/orders", icon: <ShoppingCart size={20} />, color: "#3B82F6", desc: "34 open · 9 dispatched today" },
  { label: "Markets", path: "/dashboard/markets", icon: <TrendingUp size={20} />, color: "#22C55E", desc: "Live MCX · AI forecasts" },
  { label: "Analytics", path: "/dashboard/analytics", icon: <BarChart3 size={20} />, color: "#8B5CF6", desc: "Revenue · Margins · Growth" },
];

export function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1400 }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Good morning, Admin</h1>
        <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem" }}>Here's your AYASTRA overview for today, June 10, 2026.</p>
      </motion.div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {QUICK_STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
            style={{ background: "rgba(11,17,32,0.9)", border: `1px solid ${s.color}20`, borderRadius: 14, padding: "1.1rem 1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>{s.label}</div>
                <div style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>{s.value}</div>
                <div style={{ color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{s.delta}</div>
              </div>
              <div style={{ color: s.color, background: `${s.color}15`, borderRadius: 8, padding: "0.4rem" }}>{s.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Alerts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Revenue This Week (₹L)</span>
            <span style={{ color: "#22C55E", fontSize: "0.7rem", fontFamily: "'JetBrains Mono',monospace" }}>+18.4% vs last week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={REV_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="d" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Alerts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Recent Alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ALERTS.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div style={{ marginTop: 2, flexShrink: 0, color: a.type === "ok" ? "#22C55E" : "#F59E0B" }}>
                  {a.type === "ok" ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                </div>
                <div>
                  <div style={{ color: "#e8eaf0", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif", lineHeight: 1.4 }}>{a.msg}</div>
                  <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick navigate modules */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <div style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.75rem" }}>QUICK ACCESS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
          {MODULES.map((m) => (
            <motion.button key={m.label} onClick={() => navigate(m.path)} whileHover={{ scale: 1.03, borderColor: m.color }}
              style={{ background: "rgba(11,17,32,0.6)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 14, padding: "1rem 1.1rem", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "0.75rem", transition: "border-color 0.2s" }}>
              <div style={{ color: m.color, background: `${m.color}15`, borderRadius: 10, padding: "0.5rem", flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{m.label}</div>
                <div style={{ color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>{m.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
