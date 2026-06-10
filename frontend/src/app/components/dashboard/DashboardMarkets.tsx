import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

const METALS = [
  { name: "Steel Billet", code: "STL-100", price: 48200, prev: 47640, unit: "MT", color: "#3B82F6", exchange: "MCX" },
  { name: "Copper Rod", code: "COP-8MM", price: 784500, prev: 790800, unit: "MT", color: "#F59E0B", exchange: "MCX" },
  { name: "Aluminium", code: "ALU-1050", price: 218000, prev: 213400, unit: "MT", color: "#8B5CF6", exchange: "MCX" },
  { name: "Zinc Ingot", code: "ZNC-SHG", price: 241000, prev: 241700, unit: "MT", color: "#22C55E", exchange: "MCX" },
  { name: "Lead Ingot", code: "PB-99.97", price: 187500, prev: 186600, unit: "MT", color: "#EF4444", exchange: "MCX" },
  { name: "Nickel", code: "NI-99.8", price: 1420000, prev: 1391600, unit: "MT", color: "#06B6D4", exchange: "LME" },
];

const HISTORY_6M: Record<string, { d: string; v: number }[]> = {
  STL: [{ d: "Jan", v: 45200 }, { d: "Feb", v: 46100 }, { d: "Mar", v: 44800 }, { d: "Apr", v: 46500 }, { d: "May", v: 47300 }, { d: "Jun", v: 48200 }],
  COP: [{ d: "Jan", v: 768000 }, { d: "Feb", v: 771000 }, { d: "Mar", v: 760000 }, { d: "Apr", v: 775000 }, { d: "May", v: 780000 }, { d: "Jun", v: 784500 }],
  ALU: [{ d: "Jan", v: 207000 }, { d: "Feb", v: 210000 }, { d: "Mar", v: 208000 }, { d: "Apr", v: 213000 }, { d: "May", v: 215000 }, { d: "Jun", v: 218000 }],
};

const VOL = [
  { d: "Mon", v: 4200 }, { d: "Tue", v: 6800 }, { d: "Wed", v: 5100 }, { d: "Thu", v: 7600 }, { d: "Fri", v: 9200 }, { d: "Sat", v: 3800 },
];

const FORECAST = [
  { metal: "Steel", dir: "up", confidence: 87, target: "₹49,800", period: "30d" },
  { metal: "Copper", dir: "dn", confidence: 74, target: "₹7,72,000", period: "30d" },
  { metal: "Aluminium", dir: "up", confidence: 81, target: "₹2,24,000", period: "30d" },
];

export function DashboardMarkets() {
  const [selected, setSelected] = useState("STL");

  const selMetal = METALS.find((m) => m.code.startsWith(selected));
  const chartData = HISTORY_6M[selected] ?? HISTORY_6M.STL;
  const selColor = selMetal?.color ?? "#3B82F6";

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Markets</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif" }}>Live MCX & LME prices · AI price forecasts</p>
        </div>
        <span style={{ color: "#22C55E", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, padding: "4px 10px" }}>● LIVE MCX</span>
      </div>

      {/* Ticker row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "0.6rem", marginBottom: "1.5rem" }}>
        {METALS.map((m) => {
          const pct = ((m.price - m.prev) / m.prev * 100).toFixed(2);
          const up = m.price >= m.prev;
          return (
            <motion.button key={m.code}
              onClick={() => setSelected(m.code.split("-")[0])}
              whileHover={{ scale: 1.04 }}
              style={{ background: selected === m.code.split("-")[0] ? `${m.color}15` : "rgba(11,17,32,0.9)", border: `1px solid ${selected === m.code.split("-")[0] ? m.color : "rgba(59,130,246,0.1)"}`, borderRadius: 12, padding: "0.85rem 0.75rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: m.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.72rem" }}>{m.code}</span>
                {up ? <TrendingUp size={12} style={{ color: "#22C55E" }} /> : <TrendingDown size={12} style={{ color: "#EF4444" }} />}
              </div>
              <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>
                ₹{m.price.toLocaleString()}
              </div>
              <div style={{ color: up ? "#22C55E" : "#EF4444", fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
                {up ? "+" : ""}{pct}%
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Price chart + Volume side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{selMetal?.name} — 6M Price History</span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {["STL", "COP", "ALU"].map((k) => (
                <button key={k} onClick={() => setSelected(k)}
                  style={{ background: selected === k ? `${selColor}18` : "transparent", border: `1px solid ${selected === k ? selColor : "rgba(59,130,246,0.1)"}`, borderRadius: 6, padding: "3px 8px", color: selected === k ? selColor : "#8892a4", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.7rem" }}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="d" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="v" stroke={selColor} strokeWidth={2.5} dot={{ fill: selColor, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.25rem" }}>
          <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Weekly Volume (MT)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={VOL} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis dataKey="d" tick={{ fill: "#4B5563", fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Bar dataKey="v" fill="#3B82F6" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Forecast */}
      <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 16, padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <Activity size={16} style={{ color: "#F59E0B" }} />
          <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>AI Price Forecast — 30-Day Outlook</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
          {FORECAST.map((f) => (
            <div key={f.metal} style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{f.metal}</span>
                {f.dir === "up" ? <TrendingUp size={14} style={{ color: "#22C55E" }} /> : <TrendingDown size={14} style={{ color: "#EF4444" }} />}
              </div>
              <div style={{ color: f.dir === "up" ? "#22C55E" : "#EF4444", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>{f.target}</div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif" }}>Confidence</span>
                  <span style={{ color: "#F59E0B", fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace" }}>{f.confidence}%</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, height: 4 }}>
                  <div style={{ width: `${f.confidence}%`, height: "100%", background: "#F59E0B", borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif" }}>Horizon: {f.period}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
