import { useRef } from "react";
import { motion } from "motion/react";

const metals = [
  { name: "Copper", price: "₹8,42,300", change: "+3.2%", up: true },
  { name: "Brass", price: "₹4,85,200", change: "-1.4%", up: false },
  { name: "Steel", price: "₹62,400", change: "+2.7%", up: true },
  { name: "Aluminum", price: "₹2,18,600", change: "+0.9%", up: true },
  { name: "Nickel", price: "₹14,72,000", change: "+4.1%", up: true },
  { name: "Zinc", price: "₹2,54,800", change: "+1.6%", up: true },
  { name: "Lead", price: "₹1,91,500", change: "-0.8%", up: false },
  { name: "Tin", price: "₹28,60,000", change: "+2.2%", up: true },
  { name: "Iron Ore", price: "₹9,320", change: "+1.1%", up: true },
  { name: "Scrap HMS", price: "₹38,200", change: "-0.6%", up: false },
];

function TickerItem({ metal }: { metal: typeof metals[0] }) {
  return (
    <div className="flex items-center gap-4 px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full"
          style={{ background: metal.up ? "#22C55E" : "#EF4444" }} />
        <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.875rem" }}>
          {metal.name}
        </span>
      </div>
      <span style={{ color: "#8892a4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
        {metal.price}
      </span>
      <span style={{
        color: metal.up ? "#22C55E" : "#EF4444",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.8rem",
        fontWeight: 700,
      }}>
        {metal.up ? "▲" : "▼"} {metal.change}
      </span>
      <div className="w-px h-4 mx-2" style={{ background: "rgba(59,130,246,0.2)" }} />
    </div>
  );
}

export function MarketTicker() {
  const track = [...metals, ...metals, ...metals];

  return (
    <div className="relative overflow-hidden py-4 border-y"
      style={{
        background: "rgba(11,17,32,0.95)",
        borderColor: "rgba(59,130,246,0.15)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left gradient fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(11,17,32,1), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, rgba(11,17,32,1), transparent)" }} />

      {/* Label */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 px-3 py-1 rounded text-xs font-bold"
        style={{
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#141C2E",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.05em",
        }}
      >
        LIVE
      </div>

      <motion.div
        className="flex"
        animate={{ x: [0, -100 * metals.length * 6.4] }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: "max-content", paddingLeft: "100px" }}
      >
        {track.map((metal, i) => (
          <TickerItem key={i} metal={metal} />
        ))}
      </motion.div>
    </div>
  );
}
