import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft, ArrowRight, Recycle, Users, TrendingUp, Clock,
  ShieldCheck, MapPin, Sparkles, LineChart,
} from "lucide-react";

/* ── Design tokens ── */
const NAVY   = "#0A0E1A";
const GREEN  = "#22C55E";
const GREEN_DEEP = "#15803D";
const TEXT   = "#F1F5F9";
const MUTED  = "#94A3B8";

/* ── Content ── */
const HIGHLIGHTS = [
  {
    icon: <Users size={22} />,
    title: "Verified Buyer Network",
    desc: "Connect with vetted buyers across your region and beyond — every counterparty rated for reliability and payout speed.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Real-Time Rate Comparison",
    desc: "Compare live scrap rates side by side so you always know who is offering the strongest net price today.",
  },
  {
    icon: <Clock size={22} />,
    title: "Optimal Timing AI",
    desc: "Our models read market momentum to tell you whether to sell now or hold for a better window.",
  },
];

const STEPS = [
  { n: "01", title: "List Your Scrap", desc: "Add grade, quantity and location in seconds." },
  { n: "02", title: "AI Matches Buyers", desc: "We surface the best verified buyers near you." },
  { n: "03", title: "Sell at Peak Value", desc: "Lock the highest net offer at the optimal time." },
];

const TRUST = [
  { icon: <ShieldCheck size={18} />, label: "Verified buyers only" },
  { icon: <MapPin size={18} />,      label: "Region-aware pricing" },
  { icon: <LineChart size={18} />,   label: "AI price forecasting" },
];

export function ScrapOptimizerPage() {
  const navigate = useNavigate();

  // Same auth convention the rest of the app uses: a token in localStorage
  // (set by LoginPage/SignupPage, read by the api.ts request interceptor).
  const handleExplore = () => {
    const isAuthenticated = !!localStorage.getItem("token");
    navigate(isAuthenticated ? "/dashboard/scrap-optimizer" : "/login");
  };

  return (
    <div style={{ background: NAVY, minHeight: "100vh", color: TEXT, fontFamily: "'Inter',sans-serif", overflowX: "hidden" }}>
      {/* Minimal back nav */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <button
          onClick={() => navigate("/")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: MUTED, background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
        >
          <ArrowLeft size={16} /> Back to home
        </button>
      </div>

      {/* ── HERO CARD ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: "relative",
            borderRadius: 36,
            overflow: "hidden",
            border: "1px solid rgba(34,197,94,0.18)",
            background: `
              radial-gradient(circle at top left, rgba(34,197,94,0.22), transparent 42%),
              radial-gradient(circle at bottom right, rgba(34,197,94,0.16), transparent 45%),
              linear-gradient(160deg, #0D1424 0%, #0A140F 100%)`,
            boxShadow: "0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* faint grid texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
            backgroundImage: "radial-gradient(rgba(34,197,94,0.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 20%, transparent 75%)",
          }} />

          <div style={{ position: "relative", padding: "clamp(2.5rem, 6vw, 5.5rem) 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* Large recycle icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 104, height: 104, borderRadius: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(150deg, ${GREEN}, ${GREEN_DEEP})`,
                boxShadow: `0 20px 50px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.25)`,
                marginBottom: "1.75rem",
              }}
            >
              <Recycle size={52} color="#04140A" strokeWidth={2.2} />
            </motion.div>

            {/* SCRAP badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 16px", borderRadius: 999, marginBottom: "1.5rem",
              background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.35)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
              <span style={{ color: GREEN, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", fontFamily: "'Space Grotesk',sans-serif" }}>SCRAP</span>
            </div>

            {/* Heading */}
            <h1 style={{
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
              fontSize: "clamp(2.4rem, 6vw, 4.25rem)", lineHeight: 1.05,
              letterSpacing: "-0.035em", margin: 0, color: "#fff",
              maxWidth: 780,
            }}>
              Scrap{" "}
              <span style={{ background: `linear-gradient(120deg, ${GREEN}, #4ADE80)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Optimizer
              </span>
            </h1>

            {/* Description */}
            <p style={{
              color: MUTED, fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.7,
              maxWidth: 620, margin: "1.5rem 0 0",
            }}>
              Find the best buyer and optimal selling time using AI. Compare
              real-time rates from verified buyers across your region.
            </p>

            {/* Explore Feature CTA */}
            <motion.button
              onClick={handleExplore}
              whileHover={{ scale: 1.045 }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: "2.5rem",
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "0.95rem 2.1rem", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DEEP})`,
                color: "#04140A", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem",
                boxShadow: `0 16px 44px rgba(34,197,94,0.4)`,
              }}
            >
              Explore Feature
              <ArrowRight size={18} strokeWidth={2.4} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── HIGHLIGHTS ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(4rem, 9vw, 7rem) 1.5rem 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 640, marginBottom: "3rem" }}
        >
          <span style={{ color: GREEN, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.16em", fontFamily: "'Space Grotesk',sans-serif" }}>WHY AYASTRA</span>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.03em", color: "#fff", margin: "0.75rem 0 0", lineHeight: 1.1 }}>
            Turn scrap into your best-priced sale
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {HIGHLIGHTS.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{
                position: "relative", borderRadius: 22, padding: "2rem 1.75rem",
                background: "linear-gradient(165deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))",
                border: "1px solid rgba(148,163,184,0.12)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.45), 0 0 40px rgba(34,197,94,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(148,163,184,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 15, marginBottom: "1.25rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.28)", color: GREEN,
              }}>
                {h.icon}
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#fff", margin: "0 0 0.6rem" }}>{h.title}</h3>
              <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{h.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(4rem, 9vw, 7rem) 1.5rem 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{
            position: "relative", borderRadius: 30, overflow: "hidden",
            padding: "clamp(2.5rem, 5vw, 4rem)",
            background: `radial-gradient(circle at bottom left, rgba(34,197,94,0.14), transparent 55%), linear-gradient(160deg, #0D1424, #0A140F)`,
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
            <Sparkles size={18} color={GREEN} />
            <span style={{ color: GREEN, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.16em", fontFamily: "'Space Grotesk',sans-serif" }}>HOW IT WORKS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "2.4rem", lineHeight: 1, color: "transparent", WebkitTextStroke: `1.5px ${GREEN}`, marginBottom: "1rem", opacity: 0.85 }}>{s.n}</div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff", margin: "0 0 0.5rem" }}>{s.title}</h3>
                <p style={{ color: MUTED, fontSize: "0.92rem", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(3rem, 6vw, 4.5rem) 1.5rem 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem 2.5rem" }}>
          {TRUST.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, color: MUTED, fontSize: "0.9rem" }}
            >
              <span style={{ color: GREEN }}>{t.icon}</span>
              {t.label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(4rem, 9vw, 7rem) 1.5rem clamp(4rem, 9vw, 7rem)" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{
            position: "relative", borderRadius: 30, overflow: "hidden", textAlign: "center",
            padding: "clamp(3rem, 6vw, 5rem) 1.5rem",
            background: `
              radial-gradient(circle at top right, rgba(34,197,94,0.2), transparent 45%),
              radial-gradient(circle at bottom left, rgba(34,197,94,0.14), transparent 50%),
              linear-gradient(160deg, #0D1424, #0A140F)`,
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#fff", margin: 0, lineHeight: 1.1 }}>
            Ready to sell scrap smarter?
          </h2>
          <p style={{ color: MUTED, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 500, margin: "1.25rem auto 0" }}>
            Let AI find the right buyer and the right moment — every single time.
          </p>
          <motion.button
            onClick={handleExplore}
            whileHover={{ scale: 1.045 }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: "2.25rem",
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "1rem 2.4rem", borderRadius: 14, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DEEP})`,
              color: "#04140A", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.05rem",
              boxShadow: `0 16px 44px rgba(34,197,94,0.4)`,
            }}
          >
            Explore Feature
            <ArrowRight size={18} strokeWidth={2.4} />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
