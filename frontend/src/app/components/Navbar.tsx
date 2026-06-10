import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { AstraAvatar } from "./AstraAvatar";
import { AstraChatPanel } from "./AstraChatPanel";

const FEATURES = [
  { label: "Smart Inventory",         href: "/features/smart-inventory",    icon: "📦", desc: "Real-time stock intelligence" },
  { label: "WhatsApp Automation",     href: "/features/whatsapp-automation", icon: "💬", desc: "AI-powered order processing" },
  { label: "Metal Price Intelligence", href: "/features/metal-price",        icon: "📈", desc: "Bloomberg-grade market data" },
  { label: "Business Analytics",      href: "/features/business-analytics",  icon: "📊", desc: "Enterprise-grade insights" },
];

export function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [chatOpen, setChatOpen]       = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isHome      = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node))
        setFeaturesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (isDashboard) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300"
        style={{
          background:    scrolled ? "rgba(5,8,22,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom:  scrolled ? "1px solid rgba(59,130,246,0.12)" : "none",
        }}
      >
        {/* Logo */}
        <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.03 }} onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="white" strokeWidth="1.5" fill="none"/>
              <polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"1.25rem", color:"#fff", letterSpacing:"-0.02em" }}>
            AYASTRA
          </span>
        </motion.div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {/* Features dropdown */}
          <div className="relative" ref={featuresRef}>
            <button
              onClick={() => setFeaturesOpen((o) => !o)}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
              style={{ color: featuresOpen ? "#e8eaf0" : "#8892a4", fontFamily:"'Inter',sans-serif" }}
            >
              Features
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: featuresOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {featuresOpen && (
                <motion.div
                  initial={{ opacity:0, y:8, scale:0.97 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:6, scale:0.97 }}
                  transition={{ duration:0.18 }}
                  className="absolute top-10 left-1/2 -translate-x-1/2 w-72 rounded-2xl border p-2 z-50"
                  style={{
                    background:"rgba(7,11,24,0.97)",
                    borderColor:"rgba(59,130,246,0.2)",
                    backdropFilter:"blur(40px)",
                    boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.06)",
                  }}
                >
                  <div className="absolute top-0 left-6 right-6 h-px"
                    style={{ background:"linear-gradient(90deg,transparent,#F59E0B60,transparent)" }} />
                  {FEATURES.map((f) => (
                    <button key={f.href}
                      onClick={() => { navigate(f.href); setFeaturesOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group"
                      style={{ background:"transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background="rgba(59,130,246,0.07)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; }}
                    >
                      <span className="text-lg">{f.icon}</span>
                      <div>
                        <div style={{ color:"#e8eaf0", fontSize:"0.82rem", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600 }}>{f.label}</div>
                        <div style={{ color:"#4B5563", fontSize:"0.7rem", fontFamily:"'Inter',sans-serif" }}>{f.desc}</div>
                      </div>
                      <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M7 3l4 4-4 4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => navigate("/dashboard")}
            className="text-sm font-medium transition-colors duration-200"
            style={{ color:"#8892a4", fontFamily:"'Inter',sans-serif", background:"none", border:"none", cursor:"pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color="#e8eaf0")}
            onMouseLeave={(e) => (e.currentTarget.style.color="#8892a4")}>
            Dashboard
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={() => navigate("/login")}
            className="hidden md:block px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200"
            style={{ borderColor:"rgba(59,130,246,0.3)", color:"#93C5FD", fontFamily:"'Space Grotesk',sans-serif", background:"rgba(59,130,246,0.06)" }}>
            Sign In
          </motion.button>

          {/* ASTRA AI — hidden on homepage */}
          {!isHome && (
            <div className="relative">
              <AnimatePresence>
                {showTooltip && !chatOpen && (
                  <motion.div key="tip"
                    initial={{ opacity:0, y:6, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:0.94 }}
                    transition={{ duration:0.16 }}
                    className="absolute right-0 top-14 z-10 px-3 py-1.5 rounded-lg border pointer-events-none whitespace-nowrap"
                    style={{ background:"rgba(7,11,24,0.97)", borderColor:"rgba(245,158,11,0.35)", boxShadow:"0 4px 20px rgba(59,130,246,0.12)" }}>
                    <span style={{ color:"#F59E0B", fontSize:"0.75rem", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600 }}>Ask ASTRA AI</span>
                    <div className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 border-l border-t"
                      style={{ background:"rgba(7,11,24,0.97)", borderColor:"rgba(245,158,11,0.35)" }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => setChatOpen((o) => !o)}
                onHoverStart={() => setShowTooltip(true)}
                onHoverEnd={() => setShowTooltip(false)}
                animate={{ y:[0,-4,0] }}
                transition={{ y:{ duration:3.2, repeat:Infinity, ease:"easeInOut" } }}
                whileHover={{ scale:1.12, filter:"drop-shadow(0 0 14px rgba(59,130,246,0.75)) drop-shadow(0 0 6px rgba(245,158,11,0.45))" }}
                whileTap={{ scale:0.95 }}
                className="relative cursor-pointer outline-none"
                style={{
                  filter: chatOpen ? "drop-shadow(0 0 16px rgba(59,130,246,0.85)) drop-shadow(0 0 8px rgba(245,158,11,0.5))" : "drop-shadow(0 0 8px rgba(59,130,246,0.45)) drop-shadow(0 0 3px rgba(245,158,11,0.25))",
                  transition:"filter 0.3s",
                }}
              >
                {chatOpen && (
                  <motion.div className="absolute inset-0 rounded-full"
                    animate={{ scale:[1,1.35,1], opacity:[0.6,0,0.6] }} transition={{ duration:2, repeat:Infinity, ease:"easeOut" }}
                    style={{ background:"rgba(59,130,246,0.25)", borderRadius:"50%" }} />
                )}
                <AstraAvatar size={40} />
              </motion.button>
            </div>
          )}
        </div>
      </motion.nav>

      <AstraChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
