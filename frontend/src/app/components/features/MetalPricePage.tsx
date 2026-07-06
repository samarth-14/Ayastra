import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Target, Zap, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, Bar } from "recharts";

const METALS = [
  { name: "Steel Billet", code: "STL", price: "₹48,200", change: "+1.2%", dir: "up", color: "#3B82F6" },
  { name: "Copper Rod", code: "COP", price: "₹7,84,500", change: "-0.8%", dir: "dn", color: "#F59E0B" },
  { name: "Aluminium", code: "ALU", price: "₹2,18,000", change: "+2.1%", dir: "up", color: "#8B5CF6" },
  { name: "Zinc Ingot", code: "ZNC", price: "₹2,41,000", change: "-0.3%", dir: "dn", color: "#22C55E" },
  { name: "Lead Ingot", code: "PB", price: "₹1,87,500", change: "+0.5%", dir: "up", color: "#EF4444" },
];

const PRICE_HISTORY = [
  { day: "Jan", stl: 45200, cop: 768000, alu: 207000 },
  { day: "Feb", stl: 46100, cop: 771000, alu: 210000 },
  { day: "Mar", stl: 44800, cop: 760000, alu: 208000 },
  { day: "Apr", stl: 46500, cop: 775000, alu: 213000 },
  { day: "May", stl: 47300, cop: 780000, alu: 215000 },
  { day: "Jun", stl: 48200, cop: 784500, alu: 218000 },
];

const VOL_DATA = [
  { day: "Mon", vol: 4200 },
  { day: "Tue", vol: 6800 },
  { day: "Wed", vol: 5100 },
  { day: "Thu", vol: 7600 },
  { day: "Fri", vol: 9200 },
  { day: "Sat", vol: 3800 },
];

const HEATMAP = [
  { metal: "Steel", m1: 1.2, m2: -0.5, m3: 2.1, m4: -1.0, m5: 0.8, m6: 1.5 },
  { metal: "Copper", m1: -0.8, m2: 1.4, m3: -0.3, m4: 2.6, m5: -0.6, m6: 0.9 },
  { metal: "Aluminium", m1: 2.1, m2: 0.6, m3: -1.2, m4: 1.8, m5: 0.4, m6: 1.1 },
  { metal: "Zinc", m1: -0.3, m2: -0.9, m3: 1.5, m4: -0.4, m5: 1.9, m6: -0.2 },
];

function HeatCell({ val }: { val: number }) {
  const abs = Math.abs(val);
  const alpha = Math.min(abs / 3, 1);
  const bg = val > 0 ? `rgba(34,197,94,${0.15 + alpha * 0.45})` : `rgba(239,68,68,${0.15 + alpha * 0.45})`;
  const color = val > 0 ? "#22C55E" : "#EF4444";
  return (
    <div style={{ background: bg, borderRadius: 6, padding: "0.5rem", textAlign: "center", color, fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
      {val > 0 ? "+" : ""}{val}%
    </div>
  );
}

export function MetalPricePage() {
  const navigate = useNavigate();
  const [activeMetal, setActiveMetal] = useState("stl");

  const lineColor = activeMetal === "stl" ? "#3B82F6" : activeMetal === "cop" ? "#F59E0B" : "#8B5CF6";
  const lineKey = activeMetal as keyof typeof PRICE_HISTORY[0];

  return (
    <div style={{ background: "#141C2E", minHeight: "100vh", color: "#e8eaf0" }}>
      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(5,8,22,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", height: 60 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8892a4", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            <ArrowLeft size={16} /> Home
          </button>
          <span style={{ color: "rgba(59,130,246,0.4)" }}>›</span>
          <span style={{ color: "#F59E0B", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Metal Price Intelligence</span>
          <span style={{ marginLeft: "auto", color: "#22C55E", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>● LIVE MCX DATA</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 2rem 2rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: "4px 14px", marginBottom: "1.5rem" }}>
            <Activity size={14} style={{ color: "#3B82F6" }} />
            <span style={{ color: "#3B82F6", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>METAL PRICE INTELLIGENCE</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
            Bloomberg-Grade Market Data<br />
            <span style={{ background: "linear-gradient(90deg,#F59E0B,#D97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>for Metal Businesses</span>
          </h1>
          <p style={{ color: "#8892a4", fontSize: "1.1rem", maxWidth: 580, lineHeight: 1.7, fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>
            Live MCX prices, AI-powered forecasts, historical trend analysis, and margin alerts — all in one terminal.
          </p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(59,130,246,0.4)" }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", border: "none", borderRadius: 10, padding: "0.75rem 2rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer" }}>
            Explore Market Intelligence
          </motion.button>
        </motion.div>
      </section>

      {/* Live Market Dashboard */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 2rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
          {METALS.map((m) => (
            <motion.div key={m.code} whileHover={{ scale: 1.03, borderColor: m.color }}
              style={{ background: "rgba(11,17,32,0.9)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "1.25rem", cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: m.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.8rem" }}>{m.code}</span>
                {m.dir === "up" ? <TrendingUp size={14} style={{ color: "#22C55E" }} /> : <TrendingDown size={14} style={{ color: "#EF4444" }} />}
              </div>
              <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{m.price}</div>
              <div style={{ color: m.dir === "up" ? "#22C55E" : "#EF4444", fontSize: "0.75rem", fontFamily: "'JetBrains Mono',monospace" }}>{m.change}</div>
              <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{m.name}</div>
            </motion.div>
          ))}
        </div>

        {/* Price Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>6-Month Price Trend</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[{ k: "stl", label: "Steel", color: "#3B82F6" }, { k: "cop", label: "Copper", color: "#F59E0B" }, { k: "alu", label: "Aluminium", color: "#8B5CF6" }].map((m) => (
                <button key={m.k} onClick={() => setActiveMetal(m.k)}
                  style={{ background: activeMetal === m.k ? `${m.color}20` : "transparent", border: `1px solid ${activeMetal === m.k ? m.color : "rgba(59,130,246,0.15)"}`, borderRadius: 8, padding: "4px 12px", color: activeMetal === m.k ? m.color : "#8892a4", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.75rem" }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={PRICE_HISTORY} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="day" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={2.5} dot={{ fill: lineColor, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Volume + Heatmap row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "1.5rem" }}>
          {/* Volume */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Weekly Trade Volume (MT)</div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={VOL_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Bar dataKey="vol" fill="#3B82F6" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Heatmap */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Monthly Returns Heatmap (%)</div>
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6,1fr)", gap: "0.35rem" }}>
              <div />
              {["Jan","Feb","Mar","Apr","May","Jun"].map((m) => (
                <div key={m} style={{ color: "#4B5563", fontSize: "0.65rem", fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>{m}</div>
              ))}
              {HEATMAP.map((row) => (
                <>
                  <div key={row.metal} style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center" }}>{row.metal}</div>
                  {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((v, i) => (
                    <HeatCell key={i} val={v} />
                  ))}
                </>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Forecast + Features */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.75rem" }}>AI Price Forecasting</h2>
            <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              ASTRA's ML models analyze MCX futures, currency rates, crude oil, and seasonal demand patterns to predict metal prices 30 days ahead.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { icon: <Target size={16} />, label: "87% forecast accuracy on 30-day horizon" },
                { icon: <Zap size={16} />, label: "Margin alerts when prices cross your thresholds" },
                { icon: <BarChart3 size={16} />, label: "Correlation analysis across metal pairs" },
                { icon: <Activity size={16} />, label: "Volatility scores updated every 15 minutes" },
              ].map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ color: "#F59E0B" }}>{f.icon}</div>
                  <span style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem" }}>{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Forecast confidence card */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1.25rem" }}>30-Day Forecast Confidence</div>
            {METALS.slice(0, 4).map((m, i) => (
              <div key={m.code} style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#8892a4", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>{m.name}</span>
                  <span style={{ color: m.color, fontSize: "0.78rem", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{[87, 82, 79, 91][i]}%</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6 }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${[87, 82, 79, 91][i]}%` }} transition={{ duration: 1, delay: i * 0.15 }}
                    style={{ height: "100%", background: m.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: "center", background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: "3rem 2rem" }}>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.75rem" }}>Stay ahead of every price move</h3>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>
            Real-time MCX data, AI forecasts, and margin alerts — all in one intelligent terminal.
          </p>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(59,130,246,0.4)" }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", border: "none", borderRadius: 12, padding: "1rem 2.5rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            Explore Market Intelligence →
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
