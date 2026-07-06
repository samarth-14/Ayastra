import { motion } from "motion/react";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="7" width="22" height="14" rx="2" stroke="#F59E0B" strokeWidth="1.5" fill="none"/>
        <path d="M8 11h12M8 14h8M8 17h5" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="22" cy="7" r="3" fill="#22C55E"/>
      </svg>
    ),
    title: "Smart Inventory",
    tagline: "Real-time stock visibility",
    description: "Monitor every SKU across warehouses in real time. Low-stock alerts, intelligent reorder points, and predictive stocking powered by your sales history.",
    bullets: ["Real-time stock visibility", "Low stock alerts & smart reorder", "Inventory intelligence dashboard"],
    gradient: "from-amber-500/10 to-transparent",
    accent: "#F59E0B",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 20 L10 14 L16 17 L24 8" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="14" r="2" fill="#3B82F6"/>
        <circle cx="16" cy="17" r="2" fill="#3B82F6"/>
        <circle cx="24" cy="8" r="2" fill="#22C55E"/>
        <path d="M14 22 h10 v-6" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
      </svg>
    ),
    title: "Scrap Optimizer",
    tagline: "Maximize scrap value",
    description: "Match your scrap inventory with the best buyers across India. AI identifies optimal selling windows based on market trends and buyer demand signals.",
    bullets: ["Find the best buyer instantly", "Optimize selling time with AI", "Maximize scrap value per tonne"],
    gradient: "from-blue-500/10 to-transparent",
    accent: "#3B82F6",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 20 Q8 12 14 14 Q20 16 24 6" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M4 20 Q8 12 14 14 Q20 16 24 6 L24 22 L4 22 Z" fill="rgba(139,92,246,0.1)"/>
        <circle cx="14" cy="14" r="2.5" fill="#8B5CF6"/>
        <path d="M20 4 l4 0 0 4" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Demand Forecasting",
    tagline: "Predict future demand",
    description: "AYASTRA's ML engine learns your sales cycles, seasonal patterns, and market conditions to forecast demand 30–90 days ahead with 94% accuracy.",
    bullets: ["Predict future demand (30-90 days)", "Seasonal trend analysis", "Business planning insights"],
    gradient: "from-violet-500/10 to-transparent",
    accent: "#8B5CF6",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="5" stroke="#22C55E" strokeWidth="1.5" fill="none"/>
        <path d="M9 12 l4 4 6-6" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="6" r="3" fill="#3B82F6"/>
        <path d="M21 5.5 l1 1 1.5-1.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "WhatsApp Automation",
    tagline: "Orders on autopilot",
    description: "Convert WhatsApp messages into structured orders automatically. Our NLP engine reads buyer messages, extracts order details, and enters them into your ERP — zero manual work.",
    bullets: ["Convert messages into orders", "Reduce manual data entry by 90%", "Faster order processing"],
    gradient: "from-green-500/10 to-transparent",
    accent: "#22C55E",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 overflow-hidden" style={{ background: "#141C2E" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)",
        }} />

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-6"
            style={{
              borderColor: "rgba(59,130,246,0.3)",
              background: "rgba(59,130,246,0.06)",
              color: "#93C5FD",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
            CAPABILITIES
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1.1,
          }}>
            Everything Your Metal Business Needs
          </h2>
          <p style={{ color: "#8892a4", marginTop: "1rem", fontSize: "1.05rem", fontFamily: "'Inter', sans-serif" }}>
            One platform. Every operation. Maximum intelligence.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="relative flex flex-col gap-5 p-6 rounded-2xl border cursor-default group"
              style={{
                background: "rgba(11,17,32,0.7)",
                borderColor: "rgba(59,130,246,0.12)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${feature.accent}40`;
                e.currentTarget.style.boxShadow = `0 0 40px ${feature.accent}18, 0 8px 40px rgba(0,0,0,0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.12)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
              }}
            >
              {/* Gradient top bar */}
              <div className="absolute top-0 left-6 right-6 h-px rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}50, transparent)` }} />

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${feature.accent}14`, border: `1px solid ${feature.accent}25` }}>
                {feature.icon}
              </div>

              {/* Title & tagline */}
              <div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  marginBottom: "4px",
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: feature.accent, fontSize: "0.78rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  {feature.tagline}
                </p>
              </div>

              {/* Description */}
              <p style={{ color: "#8892a4", fontSize: "0.85rem", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>
                {feature.description}
              </p>

              {/* Bullets */}
              <ul className="flex flex-col gap-2 mt-auto">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: feature.accent }} />
                    <span style={{ color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 100%, ${feature.accent}10, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
