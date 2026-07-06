import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Activity, Target, Layers, CheckCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const REVENUE_DATA = [
  { month: "Jul", rev: 42, profit: 8 },
  { month: "Aug", rev: 48, profit: 10 },
  { month: "Sep", rev: 45, profit: 9 },
  { month: "Oct", rev: 54, profit: 13 },
  { month: "Nov", rev: 61, profit: 16 },
  { month: "Dec", rev: 58, profit: 15 },
  { month: "Jan", rev: 67, profit: 19 },
  { month: "Feb", rev: 72, profit: 21 },
  { month: "Mar", rev: 78, profit: 24 },
  { month: "Apr", rev: 84, profit: 27 },
  { month: "May", rev: 91, profit: 29 },
  { month: "Jun", rev: 98, profit: 32 },
];

const DEMAND_DATA = [
  { cat: "Steel", demand: 48 },
  { cat: "Copper", demand: 22 },
  { cat: "Alum.", demand: 16 },
  { cat: "Zinc", demand: 9 },
  { cat: "Others", demand: 5 },
];

const KPIS = [
  { label: "Monthly Revenue", value: "₹98.2L", change: "+8.1%", color: "#F59E0B", icon: <DollarSign size={18} /> },
  { label: "Gross Margin", value: "32.6%", change: "+2.4pp", color: "#22C55E", icon: <TrendingUp size={18} /> },
  { label: "Active Customers", value: "284", change: "+18 MoM", color: "#3B82F6", icon: <Activity size={18} /> },
  { label: "Avg Order Value", value: "₹3.46L", change: "+5.2%", color: "#8B5CF6", icon: <Target size={18} /> },
];

const HEALTH_METRICS = [
  { label: "Revenue Growth", score: 88, color: "#22C55E" },
  { label: "Margin Health", score: 74, color: "#F59E0B" },
  { label: "Customer Retention", score: 92, color: "#22C55E" },
  { label: "Inventory Efficiency", score: 67, color: "#F59E0B" },
  { label: "Collections", score: 58, color: "#EF4444" },
];

const EXEC_INSIGHTS = [
  { icon: <TrendingUp size={16} />, title: "Revenue up 18% YoY", desc: "Copper and steel segments are the primary growth drivers this quarter.", positive: true },
  { icon: <Target size={16} />, title: "Collections slipping", desc: "Average debtor days at 48 — up from 41. Action recommended.", positive: false },
  { icon: <Layers size={16} />, title: "Inventory turning 4.2x", desc: "Above industry average of 3.8x. Optimal working capital deployment.", positive: true },
];

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        whileInView={{ strokeDasharray: `${dash} ${circ - dash}` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
      />
    </svg>
  );
}

export function BusinessAnalyticsPage() {
  const navigate = useNavigate();

  const overallScore = Math.round(HEALTH_METRICS.reduce((a, m) => a + m.score, 0) / HEALTH_METRICS.length);
  const overallColor = overallScore >= 80 ? "#22C55E" : overallScore >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ background: "#141C2E", minHeight: "100vh", color: "#e8eaf0" }}>
      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(5,8,22,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", height: 60 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8892a4", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            <ArrowLeft size={16} /> Home
          </button>
          <span style={{ color: "rgba(59,130,246,0.4)" }}>›</span>
          <span style={{ color: "#8B5CF6", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Business Analytics</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 2rem 2rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "4px 14px", marginBottom: "1.5rem" }}>
            <BarChart3 size={14} style={{ color: "#8B5CF6" }} />
            <span style={{ color: "#8B5CF6", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>BUSINESS ANALYTICS MODULE</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
            Enterprise Insights.<br />
            <span style={{ background: "linear-gradient(90deg,#8B5CF6,#6D28D9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Built for Metal CEOs.</span>
          </h1>
          <p style={{ color: "#8892a4", fontSize: "1.1rem", maxWidth: 580, lineHeight: 1.7, fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>
            Revenue analytics, demand forecasting, profit margins, and a live business health score — everything your leadership team needs in one dashboard.
          </p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", color: "#fff", border: "none", borderRadius: 10, padding: "0.75rem 2rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer" }}>
            View Business Insights
          </motion.button>
        </motion.div>
      </section>

      {/* KPI Row */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 2rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {KPIS.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ background: "rgba(11,17,32,0.9)", border: `1px solid ${k.color}25`, borderRadius: 16, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>{k.label}</div>
                  <div style={{ color: k.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1.1 }}>{k.value}</div>
                  <div style={{ color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginTop: 4 }}>{k.change}</div>
                </div>
                <div style={{ color: k.color, background: `${k.color}15`, borderRadius: 10, padding: "0.5rem" }}>{k.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Revenue + Demand Charts */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Revenue & Profit Trend (₹L)</span>
              <span style={{ color: "#22C55E", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>+18% YoY</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="rev" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 2, background: "#8B5CF6" }} /><span style={{ color: "#4B5563", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>Revenue</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 2, background: "#22C55E", borderTop: "2px dashed #22C55E" }} /><span style={{ color: "#4B5563", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>Profit</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1.25rem" }}>Sales Mix by Category</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DEMAND_DATA} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                <XAxis type="number" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="cat" type="category" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} width={45} />
                <Bar dataKey="demand" fill="#8B5CF6" fillOpacity={0.75} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* Business Health Score + Insights */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem" }}>
          {/* Health Score */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1.25rem" }}>Business Health Score</div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <ScoreRing score={overallScore} color={overallColor} size={80} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ color: overallColor, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.25rem" }}>{overallScore}</span>
                </div>
              </div>
              <div>
                <div style={{ color: overallColor, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>Good</div>
                <div style={{ color: "#8892a4", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>3 areas need attention</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {HEALTH_METRICS.map((m) => (
                <div key={m.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif" }}>{m.label}</span>
                    <span style={{ color: m.color, fontSize: "0.75rem", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{m.score}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5 }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.score}%` }} transition={{ duration: 1 }}
                      style={{ height: "100%", background: m.color, borderRadius: 4 }} viewport={{ once: true }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Executive Insights */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 20, padding: "1.5rem" }}>
            <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1.25rem" }}>Executive Insights</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {EXEC_INSIGHTS.map((ins) => (
                <div key={ins.title} style={{ background: ins.positive ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${ins.positive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                    <span style={{ color: ins.positive ? "#22C55E" : "#EF4444" }}>{ins.icon}</span>
                    <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{ins.title}</span>
                  </div>
                  <p style={{ color: "#8892a4", fontSize: "0.82rem", fontFamily: "'Inter',sans-serif", margin: 0, lineHeight: 1.5 }}>{ins.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Growth Forecast", value: "+22%", sub: "Next 12 months", color: "#22C55E" },
                { label: "Break-Even", value: "₹31.2L", sub: "Monthly threshold", color: "#3B82F6" },
                { label: "Top Customer", value: "40%", sub: "Revenue concentration", color: "#F59E0B" },
                { label: "EBITDA Margin", value: "18.4%", sub: "vs 15.1% last yr", color: "#8B5CF6" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "0.75rem 1rem" }}>
                  <div style={{ color: "#8892a4", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.15rem" }}>{stat.value}</div>
                  <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: "center", background: "rgba(11,17,32,0.8)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "3rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            {["Revenue", "Margins", "Demand", "Growth"].map((tag) => (
              <span key={tag} style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12, padding: "2px 10px", color: "#8B5CF6", fontSize: "0.72rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.75rem" }}>Run your business on data, not instinct</h3>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>
            Join 500+ metal businesses making smarter decisions with AYASTRA's analytics engine.
          </p>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", color: "#fff", border: "none", borderRadius: 12, padding: "1rem 2.5rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            View Business Insights →
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
