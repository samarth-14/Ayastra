import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ComposedChart, Line,
} from "recharts";

const historicalAndForecast = [
  { m: "Jan", actual: 812, forecast: null },
  { m: "Feb", actual: 828, forecast: null },
  { m: "Mar", actual: 819, forecast: null },
  { m: "Apr", actual: 835, forecast: null },
  { m: "May", actual: 841, forecast: null },
  { m: "Jun", actual: 842, forecast: 842 },
  { m: "Jul", actual: null, forecast: 845 },
  { m: "Aug", actual: null, forecast: 852 },
  { m: "Sep", actual: null, forecast: 869 },
  { m: "Oct", actual: null, forecast: 881 },
  { m: "Nov", actual: null, forecast: 876 },
  { m: "Dec", actual: null, forecast: 890 },
];

const demandData = [
  { m: "Jan", demand: 480, supply: 520 },
  { m: "Feb", demand: 520, supply: 495 },
  { m: "Mar", demand: 490, supply: 510 },
  { m: "Apr", demand: 560, supply: 530 },
  { m: "May", demand: 610, supply: 575 },
  { m: "Jun", demand: 640, supply: 600 },
];

const profitData = [
  { m: "Q1", profit: 182, target: 200 },
  { m: "Q2", profit: 241, target: 220 },
  { m: "Q3F", profit: 288, target: 260 },
  { m: "Q4F", profit: 334, target: 300 },
];

const radarData = [
  { metric: "Inventory", A: 88 },
  { metric: "Pricing", A: 76 },
  { metric: "Logistics", A: 92 },
  { metric: "Demand", A: 84 },
  { metric: "Scrap", A: 70 },
  { metric: "Cashflow", A: 95 },
];

const stats = [
  { value: "94%", label: "Forecast Accuracy", color: "#22C55E", change: "+6% vs Q1" },
  { value: "₹38Cr", label: "Revenue Projected Q3", color: "#F59E0B", change: "+28% YoY" },
  { value: "2,847", label: "Scrap Matches Made", color: "#3B82F6", change: "+340 this week" },
  { value: "4.2x", label: "ROI on Platform", color: "#8B5CF6", change: "vs manual ops" },
];


export function AnalyticsSection() {
  return (
    <section id="analytics" className="relative py-32 overflow-hidden" style={{ background: "#050816" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59,130,246,0.04) 0%, transparent 60%)" }} />

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
            style={{ borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.06)", color: "#A78BFA", fontFamily: "'JetBrains Mono', monospace" }}>
            INTELLIGENCE ENGINE
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1 }}>
            Predict.{" "}
            <span style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Analyze.
            </span>{" "}
            Grow.
          </h2>
          <p style={{ color: "#8892a4", marginTop: "1rem", fontSize: "1.05rem", fontFamily: "'Inter', sans-serif" }}>
            Bloomberg-grade intelligence built for the metal industry.
          </p>
        </motion.div>

        {/* KPI Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 rounded-2xl border text-center"
              style={{
                background: "rgba(11,17,32,0.7)",
                borderColor: `${stat.color}25`,
                boxShadow: `0 0 30px ${stat.color}08`,
                backdropFilter: "blur(20px)",
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.8rem", fontWeight: 700, color: stat.color, letterSpacing: "-0.02em" }}>
                {stat.value}
              </div>
              <div style={{ color: "#e8eaf0", fontSize: "0.78rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginTop: "4px" }}>
                {stat.label}
              </div>
              <div style={{ color: "#8892a4", fontSize: "0.68rem", fontFamily: "'JetBrains Mono', monospace", marginTop: "4px" }}>
                {stat.change}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main chart grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Price forecast — wide */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 p-6 rounded-2xl border"
            style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div style={{ color: "#e8eaf0", fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Copper Price Forecast
                </div>
                <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                  Historical + AI Prediction (₹'000/MT)
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-0.5" style={{ background: "#F59E0B" }} />
                  <span style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-0.5 border-dashed border-t" style={{ borderColor: "#3B82F6" }} />
                  <span style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>Forecast</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={historicalAndForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                <XAxis dataKey="m" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis domain={[800, 940]} tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="actual" stroke="#F59E0B" strokeWidth={2.5} name="Actual" connectNulls={false} dot={false} />
                <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 3" name="Forecast" connectNulls dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Business health radar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" }}
          >
            <div style={{ color: "#e8eaf0", fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: "4px" }}>
              Business Health Score
            </div>
            <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", marginBottom: "12px" }}>
              AI operational scoring
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(59,130,246,0.12)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
                <Radar name="Score" dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem", fontWeight: 700, color: "#F59E0B" }}>84</span>
              <span style={{ color: "#8892a4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>/100</span>
            </div>
          </motion.div>

          {/* Demand vs Supply */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" }}
          >
            <div style={{ color: "#e8eaf0", fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: "4px" }}>
              Demand vs Supply
            </div>
            <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", marginBottom: "12px" }}>MT / month</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={demandData} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                <XAxis dataKey="m" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <Bar dataKey="demand" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Demand" fillOpacity={0.85} />
                <Bar dataKey="supply" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Supply" fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Profit projection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl border"
            style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div style={{ color: "#e8eaf0", fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  Profit Projections
                </div>
                <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                  Quarterly outlook (₹ Lakhs) — F = Forecast
                </div>
              </div>
              <div className="px-3 py-1 rounded-lg text-xs"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", fontFamily: "'JetBrains Mono', monospace", border: "1px solid rgba(34,197,94,0.2)" }}>
                ▲ 83.5% YoY
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                <XAxis dataKey="m" tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8892a4", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}L`} />
                <Bar dataKey="profit" fill="#22C55E" radius={[4, 4, 0, 0]} name="Profit" fillOpacity={0.85} />
                <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 3" dot={false} name="Target" />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Market heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 p-6 rounded-2xl border"
          style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ color: "#e8eaf0", fontSize: "0.9rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                Market Heatmap — India
              </div>
              <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                Price movement by commodity · Last 24h
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "Copper", change: +3.2, price: "₹842k" },
              { name: "Nickel", change: +4.1, price: "₹1.47M" },
              { name: "Steel", change: +2.7, price: "₹62.4k" },
              { name: "Aluminum", change: +0.9, price: "₹218k" },
              { name: "Zinc", change: +1.6, price: "₹254k" },
              { name: "Brass", change: -1.4, price: "₹485k" },
              { name: "Lead", change: -0.8, price: "₹191k" },
              { name: "Tin", change: +2.2, price: "₹2.86M" },
              { name: "Iron Ore", change: +1.1, price: "₹9.32k" },
              { name: "Scrap HMS", change: -0.6, price: "₹38.2k" },
            ].map((item) => {
              const intensity = Math.min(Math.abs(item.change) / 5, 1);
              const bg = item.change > 0
                ? `rgba(34,197,94,${0.08 + intensity * 0.22})`
                : `rgba(239,68,68,${0.08 + intensity * 0.22})`;
              const border = item.change > 0
                ? `rgba(34,197,94,${0.2 + intensity * 0.3})`
                : `rgba(239,68,68,${0.2 + intensity * 0.3})`;
              return (
                <div key={item.name} className="p-3 rounded-xl text-center"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <div style={{ color: "#e8eaf0", fontSize: "0.8rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: "#8892a4", fontSize: "0.68rem", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>{item.price}</div>
                  <div style={{ color: item.change > 0 ? "#22C55E" : "#EF4444", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, marginTop: "4px" }}>
                    {item.change > 0 ? "+" : ""}{item.change}%
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
