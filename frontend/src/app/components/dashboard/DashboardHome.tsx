import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Package, ShoppingCart, TrendingUp, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { getDashboardSummary, getDashboardRevenueChart, getAlerts } from "../../../api";

export function DashboardHome() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";

  const [summary, setSummary] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem("company_id") || "1";
    Promise.all([
      getDashboardSummary(companyId),
      getDashboardRevenueChart(companyId),
      getAlerts(companyId),
    ]).then(([sum, rev, alr]) => {
      setSummary(sum);
      setRevenueData(rev?.data || []);
      setAlerts(alr?.slice(0, 4) || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const QUICK_STATS = [
    { label: "Today's Revenue", value: loading ? "..." : `₹${summary?.today_revenue || 0}`, delta: "+8.2%", color: "#F59E0B", icon: <TrendingUp size={16} /> },
    { label: "Open Orders", value: loading ? "..." : summary?.open_orders || 0, delta: "+5 new", color: "#3B82F6", icon: <ShoppingCart size={16} /> },
    { label: "Low Stock SKUs", value: loading ? "..." : summary?.low_stock_count || 0, delta: "Action needed", color: "#EF4444", icon: <AlertTriangle size={16} /> },
    { label: "Dispatched Today", value: loading ? "..." : summary?.dispatched_today || 0, delta: "value", color: "#22C55E", icon: <CheckCircle size={16} /> },
  ];

  const MODULES = [
    { label: "Inventory", path: "/dashboard/inventory", icon: <Package size={20} />, color: "#F59E0B", desc: "SKUs across warehouses" },
    { label: "Orders", path: "/dashboard/orders", icon: <ShoppingCart size={20} />, color: "#3B82F6", desc: "Open & dispatched" },
    { label: "Markets", path: "/dashboard/markets", icon: <TrendingUp size={20} />, color: "#22C55E", desc: "Live MCX · AI forecasts" },
    { label: "Analytics", path: "/dashboard/analytics", icon: <BarChart3 size={20} />, color: "#8B5CF6", desc: "Revenue · Margins · Growth" },
  ];

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1400 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Good morning, {name}</h1>
        <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem" }}>Here's your AYASTRA overview for today.</p>
      </motion.div>

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

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Revenue This Week (₹L)</span>
            <span style={{ color: "#22C55E", fontSize: "0.7rem", fontFamily: "'JetBrains Mono',monospace" }}>+18.4% vs last week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData.length > 0 ? revenueData : [{ d: "Mon", v: 0 }]} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Recent Alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {alerts.length === 0 ? (
              <div style={{ color: "#4B5563", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif" }}>No alerts yet</div>
            ) : alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div style={{ marginTop: 2, flexShrink: 0, color: a.alert_type === "success" ? "#22C55E" : "#F59E0B" }}>
                  {a.alert_type === "success" ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                </div>
                <div>
                  <div style={{ color: "#e8eaf0", fontSize: "0.78rem", fontFamily: "'Inter',sans-s