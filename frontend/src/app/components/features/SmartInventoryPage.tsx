import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Package, AlertTriangle, TrendingUp, Warehouse, BarChart3, CheckCircle, Zap, Shield, RefreshCw } from "lucide-react";

const BENEFITS = [
  { icon: <Zap size={18} />, title: "Real-Time Sync", desc: "Stock levels update instantly across all warehouses and channels." },
  { icon: <AlertTriangle size={18} />, title: "Smart Alerts", desc: "AI-powered low stock and overstock notifications before problems arise." },
  { icon: <TrendingUp size={18} />, title: "Demand Forecasting", desc: "Predict demand using 90-day rolling ML models per SKU." },
  { icon: <Shield size={18} />, title: "Audit Trail", desc: "Full immutable log of every inventory movement with timestamps." },
  { icon: <RefreshCw size={18} />, title: "Auto Reorder", desc: "Trigger purchase orders automatically when stock hits reorder points." },
  { icon: <BarChart3 size={18} />, title: "Valuation Engine", desc: "FIFO/LIFO/WAC costing methods with real-time P&L impact." },
];

const STOCK_ITEMS = [
  { name: "Steel Billets 100mm", sku: "STL-B100", qty: 2840, unit: "MT", val: "₹1.42Cr", status: "ok", change: "+5.2%" },
  { name: "Copper Rods 8mm", sku: "COP-R008", qty: 156, unit: "MT", val: "₹98.4L", status: "low", change: "-12.1%" },
  { name: "Aluminium Sheets 3mm", sku: "ALU-S003", qty: 890, unit: "MT", val: "₹44.5L", status: "ok", change: "+2.8%" },
  { name: "Zinc Ingots", sku: "ZNC-I001", qty: 44, unit: "MT", val: "₹11.2L", status: "critical", change: "-31.4%" },
  { name: "MS Angles 50x50", sku: "MSA-5050", qty: 1200, unit: "MT", val: "₹60.0L", status: "ok", change: "+1.4%" },
];

const WAREHOUSES = [
  { name: "Mumbai Main", used: 78, capacity: 5000, items: 1240 },
  { name: "Pune Annex", used: 52, capacity: 2500, items: 640 },
  { name: "Delhi North", used: 91, capacity: 3200, items: 2100 },
  { name: "Surat Hub", used: 34, capacity: 1800, items: 380 },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    ok: { label: "In Stock", color: "#22C55E" },
    low: { label: "Low Stock", color: "#F59E0B" },
    critical: { label: "Critical", color: "#EF4444" },
  };
  const s = map[status] ?? map.ok;
  return (
    <span style={{ color: s.color, background: s.color + "18", border: `1px solid ${s.color}40`, borderRadius: 6, padding: "2px 8px", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function WarehouseBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: 4 }}
      />
    </div>
  );
}

export function SmartInventoryPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#050816", minHeight: "100vh", color: "#e8eaf0" }}>
      {/* Top nav bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(5,8,22,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", height: 60 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8892a4", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            <ArrowLeft size={16} /> Home
          </button>
          <span style={{ color: "rgba(59,130,246,0.4)" }}>›</span>
          <span style={{ color: "#F59E0B", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Smart Inventory</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "4px 14px", marginBottom: "1.5rem" }}>
            <Package size={14} style={{ color: "#F59E0B" }} />
            <span style={{ color: "#F59E0B", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>SMART INVENTORY MODULE</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
            Inventory Intelligence<br />
            <span style={{ background: "linear-gradient(90deg,#F59E0B,#D97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Built for Metal Dealers</span>
          </h1>
          <p style={{ color: "#8892a4", fontSize: "1.15rem", maxWidth: 600, lineHeight: 1.7, fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>
            Real-time stock visibility across every warehouse, grade, and SKU. Never lose a sale to stockouts or tie up cash in overstock again.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(245,158,11,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#050816", border: "none", borderRadius: 10, padding: "0.75rem 2rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer" }}
            >
              Launch Inventory Module
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/dashboard/inventory")}
              style={{ background: "rgba(59,130,246,0.1)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "0.75rem 2rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, cursor: "pointer" }}
            >
              View Dashboard
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(20px)" }}
        >
          {/* Window chrome */}
          <div style={{ background: "rgba(5,8,22,0.6)", borderBottom: "1px solid rgba(59,130,246,0.1)", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ marginLeft: 12, color: "#4B5563", fontSize: "0.75rem", fontFamily: "'JetBrains Mono',monospace" }}>AYASTRA — Inventory Manager</span>
          </div>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: "rgba(59,130,246,0.08)" }}>
            {[
              { label: "Total SKUs", value: "2,847", change: "+12", color: "#3B82F6" },
              { label: "Inventory Value", value: "₹8.4Cr", change: "+3.2%", color: "#F59E0B" },
              { label: "Low Stock Alerts", value: "18", change: "Action needed", color: "#EF4444" },
              { label: "Turnover Rate", value: "4.2x", change: "vs 3.8x last qtr", color: "#22C55E" },
            ].map((k) => (
              <div key={k.label} style={{ background: "rgba(11,17,32,0.9)", padding: "1.25rem 1.5rem" }}>
                <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{k.label}</div>
                <div style={{ color: k.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: 2 }}>{k.value}</div>
                <div style={{ color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>{k.change}</div>
              </div>
            ))}
          </div>

          {/* Stock table */}
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Live Stock Overview</span>
              <span style={{ color: "#22C55E", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>● LIVE</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                  {["Product", "SKU", "Quantity", "Value", "Change", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STOCK_ITEMS.map((item) => (
                  <tr key={item.sku} style={{ borderBottom: "1px solid rgba(59,130,246,0.05)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.75rem", color: "#e8eaf0", fontSize: "0.82rem", fontFamily: "'Inter',sans-serif" }}>{item.name}</td>
                    <td style={{ padding: "0.75rem", color: "#4B5563", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>{item.sku}</td>
                    <td style={{ padding: "0.75rem", color: "#e8eaf0", fontSize: "0.82rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{item.qty} {item.unit}</td>
                    <td style={{ padding: "0.75rem", color: "#F59E0B", fontSize: "0.82rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{item.val}</td>
                    <td style={{ padding: "0.75rem", color: item.change.startsWith("+") ? "#22C55E" : "#EF4444", fontSize: "0.78rem", fontFamily: "'JetBrains Mono',monospace" }}>{item.change}</td>
                    <td style={{ padding: "0.75rem" }}><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* Warehouse Visualization */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.5rem" }}>Multi-Warehouse Overview</h2>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>Manage capacity and utilization across all your storage locations in one view.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1rem" }}>
          {WAREHOUSES.map((w, i) => (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, borderColor: "rgba(245,158,11,0.3)" }}
              style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.5rem", cursor: "pointer", transition: "border-color 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: 4 }}>{w.name}</div>
                  <div style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif" }}>{w.items} active SKUs</div>
                </div>
                <div style={{ color: w.used > 85 ? "#EF4444" : w.used > 65 ? "#F59E0B" : "#22C55E", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{w.used}%</div>
              </div>
              <WarehouseBar pct={w.used} color={w.used > 85 ? "#EF4444" : w.used > 65 ? "#F59E0B" : "#22C55E"} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>0 MT</span>
                <span style={{ color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>{w.capacity.toLocaleString()} MT capacity</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.5rem" }}>Everything You Need</h2>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>Enterprise inventory intelligence designed for the metal industry.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1rem" }}>
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              style={{ background: "rgba(11,17,32,0.6)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 14, padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}
            >
              <div style={{ color: "#F59E0B", marginTop: 2, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: 4 }}>{b.title}</div>
                <div style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{ marginTop: "4rem", textAlign: "center", background: "rgba(11,17,32,0.8)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "3rem 2rem" }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: "1rem" }}>
            {[CheckCircle, CheckCircle, CheckCircle].map((Icon, i) => (
              <Icon key={i} size={16} style={{ color: "#22C55E" }} />
            ))}
          </div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.75rem" }}>Ready to take control of your inventory?</h3>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>Join 500+ metal dealers already running on AYASTRA's Smart Inventory module.</p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(245,158,11,0.5)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#050816", border: "none", borderRadius: 12, padding: "1rem 2.5rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          >
            Launch Inventory Module →
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
