import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AstraAvatar } from "./AstraAvatar";
import { chatWithAstra } from "../../api";

interface Message {
  role: "user" | "astra";
  text: string;
  ts: string;
}

const quickActions = [
  { label: "Predict copper prices", icon: "📈", prompt: "What is the copper price forecast for next month?" },
  { label: "Forecast demand", icon: "🔮", prompt: "Forecast steel demand for the next quarter." },
  { label: "Analyze inventory", icon: "📦", prompt: "Analyze my current inventory health and risks." },
  { label: "Optimize scrap sales", icon: "♻️", prompt: "How can I optimize my scrap sales this week?" },
  { label: "Business report", icon: "📊", prompt: "Generate a business performance summary for this month." },
  { label: "Market insights", icon: "🌐", prompt: "What are the key metal market insights for today?" },
];

const botReplies: Record<string, string> = {
  default: "I'm analyzing that for you. Based on current market signals and your inventory data, I recommend staying alert to LME movements and regional demand shifts. Want a detailed breakdown?",
  copper: "📈 **Copper Forecast:** Based on LME data + India import trends, copper is projected to rise **+2.8–4.1%** over the next 30 days. Key driver: China infrastructure spending + monsoon construction demand in Western India. Recommended action: Increase copper inventory by 15–20 MT before Thursday.",
  demand: "🔮 **Demand Forecast:** Steel demand is expected to surge **+18%** in Q3 driven by infrastructure projects in Maharashtra & Gujarat. Aluminum demand will dip slightly (−3%) due to auto sector slowdown. I recommend adjusting your procurement mix accordingly.",
  inventory: "📦 **Inventory Analysis:** Your Brass Sheets are critically low (320/800 MT — 40%). Copper Rods are healthy at 84%. Nickel Ingots at 24% — immediate reorder recommended. I've flagged 3 preferred suppliers for you. Shall I initiate a reorder request?",
  scrap: "♻️ **Scrap Optimization:** Current HMS-1 buyer demand is highest in Rajkot and Surat markets. Selling now yields **₹38,400/MT** vs a 7-day average of ₹37,100. That's +3.5% premium. I've identified 4 verified buyers with same-day pickup. Want me to connect you?",
  report: "📊 **Monthly Summary:** Revenue ₹42.7L (+18.2% MoM). Top performer: Copper Rods (₹18.4L). Scrap recycling saved ₹3.2L in procurement costs. AI-triggered orders: 47. Manual errors avoided: 12. Overall business health score: **84/100**. Full PDF report ready to export.",
  market: "🌐 **Market Insights Today:** LME Copper +0.8% overnight. Zinc hit 3-month high on European energy news. India steel mills running at 91% capacity — bullish for scrap pricing. Watch Nickel — geopolitical supply risk from Indonesia export policy. Recommend holding Nickel positions.",
};

function getBotReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("copper") || t.includes("price")) return botReplies.copper;
  if (t.includes("demand") || t.includes("forecast") || t.includes("steel")) return botReplies.demand;
  if (t.includes("inventory") || t.includes("stock")) return botReplies.inventory;
  if (t.includes("scrap") || t.includes("sell")) return botReplies.scrap;
  if (t.includes("report") || t.includes("summary") || t.includes("business")) return botReplies.report;
  if (t.includes("market") || t.includes("insight") || t.includes("trend")) return botReplies.market;
  return botReplies.default;
}

const welcome: Message = {
  role: "astra",
  text: "Hello! I'm ASTRA AI, your Metal Intelligence Assistant. I can help you forecast metal prices, analyze inventory, optimize scrap sales, and generate business insights. What would you like to explore?",
  ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AstraChatPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", text, ts }]);
    setInput("");
    setTyping(true);
    
    try {
      // Try to get response from API
      const apiResponse = await chatWithAstra(text);
      
      if (apiResponse && apiResponse.reply) {
        // API responded with real data
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "astra", text: apiResponse.reply, ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ]);
      } else {
        // Fall back to mock replies if API not available
        setTimeout(() => {
          setTyping(false);
          setMessages((prev) => [
            ...prev,
            { role: "astra", text: getBotReply(text), ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
          ]);
        }, 1200 + Math.random() * 600);
      }
    } catch (error) {
      // Error calling API - use mock replies
      console.error("Error calling AI:", error);
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "astra", text: getBotReply(text), ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ]);
      }, 1200 + Math.random() * 600);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(5,8,22,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: "400px",
              background: "rgba(7, 11, 24, 0.97)",
              borderLeft: "1px solid rgba(59,130,246,0.2)",
              boxShadow: "-20px 0 80px rgba(59,130,246,0.08), -4px 0 20px rgba(0,0,0,0.6)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* ── HEADER ── */}
            <div className="relative flex items-center gap-3 px-5 py-4 border-b shrink-0"
              style={{ borderColor: "rgba(59,130,246,0.15)" }}>
              {/* Gold top bar */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, #F59E0B60, #3B82F660, transparent)" }} />

              {/* Avatar */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(59,130,246,0.55)) drop-shadow(0 0 2px rgba(245,158,11,0.3))",
                  }}
                >
                  <AstraAvatar size={44} />
                </motion.div>
                {/* Online dot */}
                <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
                  style={{ background: "#22C55E", borderColor: "rgba(7,11,24,0.97)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#fff", letterSpacing: "-0.01em" }}>
                  ASTRA AI
                </div>
                <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif" }}>
                  Metal Intelligence Assistant
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                style={{ borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.07)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
                <span style={{ color: "#22C55E", fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>ONLINE</span>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ color: "#8892a4" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.color = "#e8eaf0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8892a4"; }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(59,130,246,0.1)" }}>
              <div style={{ color: "#8892a4", fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", marginBottom: "8px" }}>
                QUICK ACTIONS
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => sendMessage(qa.prompt)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-200 group"
                    style={{ borderColor: "rgba(59,130,246,0.15)", background: "rgba(59,130,246,0.04)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)"; e.currentTarget.style.background = "rgba(245,158,11,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.background = "rgba(59,130,246,0.04)"; }}
                  >
                    <span style={{ fontSize: "0.85rem" }}>{qa.icon}</span>
                    <span style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}
                      className="group-hover:text-[#e8eaf0] transition-colors duration-200">
                      {qa.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── MESSAGES ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(59,130,246,0.2) transparent" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {msg.role === "astra" ? (
                    <div className="shrink-0 mt-0.5" style={{ filter: "drop-shadow(0 0 5px rgba(59,130,246,0.4))" }}>
                      <AstraAvatar size={28} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#050816", fontWeight: 700, fontSize: "0.65rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                      YOU
                    </div>
                  )}

                  {/* Bubble */}
                  <div className="flex flex-col gap-1 max-w-[78%]">
                    <div
                      className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={msg.role === "astra" ? {
                        background: "rgba(17,24,39,0.9)",
                        border: "1px solid rgba(59,130,246,0.18)",
                        color: "#e8eaf0",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.82rem",
                        borderRadius: "4px 16px 16px 16px",
                        boxShadow: "0 2px 12px rgba(59,130,246,0.06)",
                      } : {
                        background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))",
                        border: "1px solid rgba(245,158,11,0.25)",
                        color: "#e8eaf0",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.82rem",
                        borderRadius: "16px 4px 16px 16px",
                      }}
                    >
                      {msg.text}
                    </div>
                    <div style={{ color: "#4B5563", fontSize: "0.62rem", fontFamily: "'JetBrains Mono', monospace", textAlign: msg.role === "user" ? "right" : "left" }}>
                      {msg.ts}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex gap-3 items-center"
                  >
                    <div style={{ filter: "drop-shadow(0 0 5px rgba(59,130,246,0.4))" }}>
                      <AstraAvatar size={28} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                      style={{ background: "rgba(17,24,39,0.9)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: "4px 16px 16px 16px" }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#3B82F6" }}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.22 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* ── INPUT ── */}
            <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: "rgba(59,130,246,0.12)" }}>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder="Ask about metal prices, inventory, demand, or market trends..."
                    rows={2}
                    className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(17,24,39,0.8)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      color: "#e8eaf0",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                      placeholderColor: "#8892a4",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(245,158,11,0.08)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(245,158,11,0.45)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(59,130,246,0.1)",
                    color: input.trim() ? "#050816" : "#4B5563",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8 L2 2 L5 8 L2 14 Z" fill="currentColor"/>
                    <line x1="5" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>
              <div style={{ color: "#374151", fontSize: "0.6rem", fontFamily: "'JetBrains Mono', monospace", marginTop: "8px", textAlign: "center" }}>
                ASTRA AI · Powered by AYASTRA Intelligence Engine · v2.4.1
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
