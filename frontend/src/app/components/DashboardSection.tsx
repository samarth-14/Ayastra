import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

const priceData = [
  { t: "Jan", copper: 812, steel: 58, aluminum: 205 },
  { t: "Feb", copper: 828, steel: 60, aluminum: 210 },
  { t: "Mar", copper: 819, steel: 57, aluminum: 208 },
  { t: "Apr", copper: 835, steel: 62, aluminum: 214 },
  { t: "May", copper: 841, steel: 61, aluminum: 218 },
  { t: "Jun", copper: 842, steel: 62, aluminum: 219 },
];

const inventoryData = [
  { name: "Copper Rods", stock: 842, max: 1000, color: "#F59E0B" },
  { name: "Brass Sheets", stock: 320, max: 800, color: "#3B82F6" },
  { name: "Steel Beams", stock: 640, max: 700, color: "#22C55E" },
  { name: "Aluminum Coils", stock: 180, max: 600, color: "#8B5CF6" },
  { name: "Nickel Ingots", stock: 95, max: 400, color: "#EF4444" },
];

const revenueData = [
  { m: "Jan", rev: 24.2 }, { m: "Feb", rev: 28.6 }, { m: "Mar", rev: 22.1 },
  { m: "Apr", rev: 31.4 }, { m: "May", rev: 38.2 }, { m: "Jun", rev: 42.7 },
];

const aiRecs = [
  { icon: "▲", color: "#22C55E", text: "Sell Copper now — 3% above 30-day avg", badge: "BUY" },
  { icon: "⚠", color: "#F59E0B", text: "Brass stock low — reorder 200MT by Fri", badge: "ALERT" },
  { icon: "▼", color: "#EF4444", text: "Steel prices dipping — hold purchasing", badge: "HOLD" },
  { icon: "✦", color: "#3B82F6", text: "Nickel demand surge predicted in Q3", badge: "FORECAST" },
];


export function DashboardSection() {
  return (
    <section id="dashboard" className="relative py-32 overflow-hidden" style={{ background: "#0B1120" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,158,11,0.03) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-6"
            style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.06)", color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace" }}>
            COMMAND CENTER
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1 }}>
            Your Business at a Glance
          </h2>
          <p style={{ color: "#8892a4", marginTop: "1rem", fontSize: "1.05rem", fontFamily: "'Inter', sans-serif" }}>
            Real-time intelligence across every operation.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(5,8,22,0.9)",
            borderColor: "rgba(59,130,246,0.2)",
            boxShadow: "0 0 80px rgba(59,130,246,0.08), 0 40px 80px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Dashboard chrome bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(59,130,246,0.12)" }}>
            <div className="flex gap-1.5">
              {["#EF4444", "#F59E0B", "#22C55E"].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.8 }} />
              ))}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="px-4 py-1 rounded-lg text-xs" style={{ background: "rgba(59,130,246,0.08)", color: "#8892a4", fontFamily: "'JetBrains Mono', monospace" }}>
                app.ayastra.ai/dashboard
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#22C55E", fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
              LIVE
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue cards row */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Today's Revenue", value: "₹42.7L", change: "+18.2%", up: true, icon: "₹" },
                { label: "Active Orders", value: "284", change: "+7 new", up: true, icon: "📋" },
                { label: "Inventory Value", value: "₹8.4Cr", change: "-2.1%", up: false, icon: "📦" },
                { label: "AI Alerts", value: "3", change: "Action needed", up: false, icon: "⚡" },
              ].map((card) => (
                <div key={card.label} className="p-4 rounded-xl border"
                  style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)" }}>
                  <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", marginBottom: "6px" }}>{card.label}</div>
                  <div style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {card.value}
                  </div>
                  <div style={{ color: card.up ? "#22C55E" : "#EF4444", fontSize: "0.72rem", marginTop: "4px", fontFamily: "'JetBrains Mono', monospace" }}>
                    {card.up ? "▲" : "▼"} {card.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="lg:col-span-2 p-4 rounded-xl border" style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)" }}>
              <div className="flex items-center justify-between mb-4">
                <div style={{ color: "#e8eaf0", fontSize: "0.85rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Revenue Trend</div>
                <div className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace" }}>6M</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="m" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} />
                  <Line type="monotone" dataKey="rev" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Recommendations */}
            <div className="p-4 rounded-xl border flex flex-col gap-3" style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)" }}>
              <div style={{ color: "#e8eaf0", fontSize: "0.85rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: "4px" }}>
                AI Recommendations
              </div>
              {aiRecs.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.08)" }}>
                  <span style={{ color: rec.color, fontSize: "0.9rem" }}>{rec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#e8eaf0", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>{rec.text}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-xs shrink-0"
                    style={{ background: `${rec.color}15`, color: rec.color, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 700 }}>
                    {rec.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Metal price chart */}
            <div className="lg:col-span-2 p-4 rounded-xl border" style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)" }}>
              <div className="flex items-center justify-between mb-4">
                <div style={{ color: "#e8eaf0", fontSize: "0.85rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Metal Prices (₹ '000/MT)</div>
                <div className="flex gap-3">
                  {[{ label: "Copper", color: "#F59E0B" }, { label: "Steel", color: "#3B82F6" }, { label: "Aluminum", color: "#22C55E" }].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      <span style={{ color: "#8892a4", fontSize: "0.68rem", fontFamily: "'JetBrains Mono', monospace" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                  <XAxis dataKey="t" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="copper" stroke="#F59E0B" strokeWidth={2} dot={false} name="Copper" />
                  <Line type="monotone" dataKey="steel" stroke="#3B82F6" strokeWidth={2} dot={false} name="Steel" />
                  <Line type="monotone" dataKey="aluminum" stroke="#22C55E" strokeWidth={2} dot={false} name="Aluminum" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory status */}
            <div className="p-4 rounded-xl border" style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)" }}>
              <div style={{ color: "#e8eaf0", fontSize: "0.85rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: "12px" }}>
                Inventory Status
              </div>
              <div className="flex flex-col gap-3">
                {inventoryData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif" }}>{item.name}</span>
                      <span style={{ color: item.color, fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>
                        {item.stock}/{item.max}MT
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(59,130,246,0.08)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.stock / item.max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
