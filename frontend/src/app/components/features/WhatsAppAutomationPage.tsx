import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MessageCircle, Bot, Package, FileText, CheckCircle, Zap, Brain, Clock, Shield } from "lucide-react";

const FLOW_STEPS = [
  { icon: <MessageCircle size={22} />, color: "#25D366", label: "Customer Message", desc: "Customer sends WhatsApp order", detail: "\"Hi, I need 50MT Steel Billets 100mm, deliver to Pune by Friday\"" },
  { icon: <Brain size={22} />, color: "#3B82F6", label: "AI Extraction", desc: "NLP parses order intent", detail: "SKU: STL-B100 | Qty: 50MT | Delivery: Pune | Date: Fri" },
  { icon: <Package size={22} />, color: "#F59E0B", label: "Inventory Check", desc: "Real-time stock verification", detail: "Available: 2,840MT ✓ | Reserved: 0 | Net: 2,840MT" },
  { icon: <FileText size={22} />, color: "#8B5CF6", label: "Order Created", desc: "PO auto-generated", desc2: "SO-2024-8821 created in ERP", detail: "SO-2024-8821 | ₹28.5L | Terms: 30-day net" },
  { icon: <CheckCircle size={22} />, color: "#22C55E", label: "Confirmation Sent", desc: "WhatsApp reply dispatched", detail: "\"Your order for 50MT Steel Billets confirmed. Delivery: Friday. Ref: SO-2024-8821\"" },
];

const CHAT_MSGS = [
  { from: "customer", text: "Hi Ayastra, need 50MT steel billets 100mm grade, delivery Pune, this Friday." },
  { from: "bot", text: "Got it! Let me check availability for 50MT Steel Billets 100mm..." },
  { from: "bot", text: "✅ 50MT available. Delivery to Pune confirmed for Friday.\n\nOrder Ref: SO-2024-8821\nAmount: ₹28,50,000\n\nReply YES to confirm." },
  { from: "customer", text: "YES" },
  { from: "bot", text: "🎉 Order confirmed! You'll receive dispatch details by Thursday 5PM.\n\nThank you for choosing AYASTRA." },
];

const BENEFITS = [
  { icon: <Zap size={18} />, title: "0-Touch Order Processing", desc: "Orders flow from WhatsApp into your ERP with zero manual entry." },
  { icon: <Clock size={18} />, title: "24/7 Order Acceptance", desc: "AI accepts and processes orders round the clock, even on holidays." },
  { icon: <Brain size={18} />, title: "Multilingual NLP", desc: "Understands Hindi, English, and regional language order messages." },
  { icon: <Shield size={18} />, title: "Error-Free", desc: "Eliminates transcription mistakes that cause wrong deliveries." },
];

function ChatBubble({ msg, delay }: { msg: typeof CHAT_MSGS[0]; delay: number }) {
  const isBot = msg.from === "bot";
  return (
    <motion.div
      initial={{ opacity: 0, x: isBot ? -20 : 20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: "0.75rem" }}
    >
      {isBot && (
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 4 }}>
          <Bot size={14} style={{ color: "#fff" }} />
        </div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isBot ? "rgba(59,130,246,0.15)" : "rgba(37,211,102,0.18)",
        border: `1px solid ${isBot ? "rgba(59,130,246,0.25)" : "rgba(37,211,102,0.25)"}`,
        borderRadius: isBot ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        padding: "0.6rem 0.9rem",
        color: "#e8eaf0",
        fontSize: "0.8rem",
        fontFamily: "'Inter',sans-serif",
        lineHeight: 1.6,
        whiteSpace: "pre-line",
      }}>
        {msg.text}
      </div>
    </motion.div>
  );
}

export function WhatsAppAutomationPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [chatVisible, setChatVisible] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setActiveStep((s) => (s + 1) % FLOW_STEPS.length), 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ background: "#141C2E", minHeight: "100vh", color: "#e8eaf0" }}>
      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(5,8,22,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(59,130,246,0.12)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", height: 60 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8892a4", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
            <ArrowLeft size={16} /> Home
          </button>
          <span style={{ color: "rgba(59,130,246,0.4)" }}>›</span>
          <span style={{ color: "#25D366", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>WhatsApp Automation</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 20, padding: "4px 14px", marginBottom: "1.5rem" }}>
            <MessageCircle size={14} style={{ color: "#25D366" }} />
            <span style={{ color: "#25D366", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>WHATSAPP ORDER AUTOMATION</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
            Orders in. Processed.<br />
            <span style={{ background: "linear-gradient(90deg,#25D366,#128C7E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zero human touch.</span>
          </h1>
          <p style={{ color: "#8892a4", fontSize: "1.15rem", maxWidth: 580, lineHeight: 1.7, fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>
            Your customers send orders on WhatsApp. ASTRA AI reads, validates, and creates the order in your system — automatically, in seconds.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(37,211,102,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", border: "none", borderRadius: 10, padding: "0.75rem 2rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer" }}
          >
            Automate Orders
          </motion.button>
        </motion.div>
      </section>

      {/* Flow Animation */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.5rem" }}>How It Works</h2>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem" }}>From WhatsApp message to confirmed order in under 10 seconds.</p>
        </motion.div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto", padding: "0.5rem 0" }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 160 }}>
              <motion.div
                animate={{ scale: activeStep === i ? 1.05 : 1, borderColor: activeStep === i ? step.color : "rgba(59,130,246,0.15)" }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, background: "rgba(11,17,32,0.8)", border: `2px solid ${activeStep === i ? step.color : "rgba(59,130,246,0.15)"}`, borderRadius: 16, padding: "1.5rem 1rem", textAlign: "center", cursor: "pointer", transition: "all 0.3s" }}
                onClick={() => setActiveStep(i)}
              >
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${step.color}20`, border: `2px solid ${step.color}50`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: step.color }}>
                  {step.icon}
                </div>
                <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.82rem", marginBottom: 4 }}>{step.label}</div>
                <div style={{ color: "#4B5563", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>{step.desc}</div>
                <AnimatePresence>
                  {activeStep === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: "0.75rem", background: `${step.color}12`, border: `1px solid ${step.color}30`, borderRadius: 8, padding: "0.5rem 0.6rem" }}
                    >
                      <div style={{ color: step.color, fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.5 }}>{step.detail}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              {i < FLOW_STEPS.length - 1 && (
                <motion.div
                  animate={{ opacity: activeStep === i ? 1 : 0.3 }}
                  style={{ padding: "0 6px", color: FLOW_STEPS[i].color, flexShrink: 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Chat Simulation */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.75rem" }}>See It In Action</h2>
            <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Watch a real order conversation play out. ASTRA AI processes natural language messages just like a human would — but in milliseconds.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                "Processes orders in 7 languages",
                "Understands mixed Hindi-English",
                "Handles partial order info, asks follow-ups",
                "Validates against live inventory",
                "Sends formatted confirmations",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <CheckCircle size={16} style={{ color: "#25D366", flexShrink: 0 }} />
                  <span style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.9rem" }}>{f}</span>
                </div>
              ))}
            </div>
            {!chatVisible && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setChatVisible(true)}
                style={{ marginTop: "1.5rem", background: "rgba(37,211,102,0.1)", color: "#25D366", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, padding: "0.65rem 1.5rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, cursor: "pointer" }}
              >
                ▶ Play Simulation
              </motion.button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            style={{ background: "rgba(11,17,32,0.9)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 20, overflow: "hidden" }}
          >
            {/* WhatsApp chrome */}
            <div style={{ background: "#128C7E", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={18} style={{ color: "#fff" }} />
              </div>
              <div>
                <div style={{ color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>AYASTRA Orders</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>Online · Typically replies instantly</div>
              </div>
            </div>
            <div style={{ padding: "1rem", minHeight: 280, background: "rgba(5,8,22,0.6)" }}>
              {chatVisible
                ? CHAT_MSGS.map((msg, i) => <ChatBubble key={i} msg={msg} delay={i * 0.8} />)
                : <div style={{ color: "#4B5563", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", textAlign: "center", paddingTop: "4rem" }}>Click "Play Simulation" to watch a live order</div>
              }
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits + CTA */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1rem", marginBottom: "3rem" }}>
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
              style={{ background: "rgba(11,17,32,0.6)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 14, padding: "1.5rem", display: "flex", gap: "1rem" }}>
              <div style={{ color: "#25D366", flexShrink: 0, marginTop: 2 }}>{b.icon}</div>
              <div>
                <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: 4 }}>{b.title}</div>
                <div style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: "center", background: "rgba(11,17,32,0.8)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 20, padding: "3rem 2rem" }}>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.75rem", marginBottom: "0.75rem" }}>Automate your order intake today</h3>
          <p style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>
            Set up in 15 minutes. Connect your WhatsApp Business number. Let ASTRA handle the rest.
          </p>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(37,211,102,0.4)" }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", border: "none", borderRadius: 12, padding: "1rem 2.5rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            Automate Orders →
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
