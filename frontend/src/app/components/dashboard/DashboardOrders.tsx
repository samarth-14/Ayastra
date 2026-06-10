import { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, MessageCircle, Truck, Clock, CheckCircle } from "lucide-react";

const ORDERS = [
  { id: "SO-2024-8821", customer: "Rajesh Metals", items: "50MT Steel Billets", amount: "₹28.5L", status: "dispatched", channel: "whatsapp", date: "Jun 10", eta: "Jun 11" },
  { id: "SO-2024-8820", customer: "Gupta Iron Works", items: "12MT Copper Rod", amount: "₹93.8L", status: "processing", channel: "manual", date: "Jun 10", eta: "Jun 13" },
  { id: "SO-2024-8819", customer: "Patel Alloys", items: "200MT MS Angles", amount: "₹96.0L", status: "pending", channel: "whatsapp", date: "Jun 10", eta: "Jun 14" },
  { id: "SO-2024-8818", customer: "Delhi Steel Depot", items: "80MT HR Coils", amount: "₹41.6L", status: "dispatched", channel: "manual", date: "Jun 9", eta: "Jun 10" },
  { id: "SO-2024-8817", customer: "Mumbai Traders", items: "5MT Zinc Ingots", amount: "₹12.0L", status: "confirmed", channel: "whatsapp", date: "Jun 9", eta: "Jun 12" },
  { id: "SO-2024-8816", customer: "Surat Metals Co.", items: "30MT Aluminium Sheets", amount: "₹64.8L", status: "confirmed", channel: "manual", date: "Jun 8", eta: "Jun 11" },
  { id: "SO-2024-8815", customer: "Chennai Iron", items: "100MT Steel Billets", amount: "₹57.0L", status: "delivered", channel: "whatsapp", date: "Jun 7", eta: "Jun 9" },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "#F59E0B", icon: <Clock size={12} /> },
  confirmed: { label: "Confirmed", color: "#3B82F6", icon: <CheckCircle size={12} /> },
  processing: { label: "Processing", color: "#8B5CF6", icon: <Clock size={12} /> },
  dispatched: { label: "Dispatched", color: "#22C55E", icon: <Truck size={12} /> },
  delivered: { label: "Delivered", color: "#4B5563", icon: <CheckCircle size={12} /> },
};

export function DashboardOrders() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = ORDERS.filter((o) => {
    const m = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || o.status === filter;
    return m && f;
  });

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Orders</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif" }}>34 active orders · 9 dispatched today</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", border: "none", borderRadius: 10, padding: "0.6rem 1.25rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> New Order
        </motion.button>
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {["all", "pending", "confirmed", "processing", "dispatched", "delivered"].map((f) => {
          const s = STATUS_MAP[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? (s ? `${s.color}18` : "rgba(245,158,11,0.12)") : "rgba(11,17,32,0.8)", border: `1px solid ${filter === f ? (s?.color ?? "#F59E0B") + "50" : "rgba(59,130,246,0.12)"}`, borderRadius: 8, padding: "0.4rem 0.85rem", color: filter === f ? (s?.color ?? "#F59E0B") : "#8892a4", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.75rem" }}>
              {f === "all" ? "All Orders" : s?.label}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..."
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "0.4rem 0.75rem 0.4rem 2rem", color: "#e8eaf0", fontFamily: "'Inter',sans-serif", fontSize: "0.82rem", outline: "none", width: 200 }} />
        </div>
      </div>

      {/* Orders table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              {["Order ID", "Customer", "Items", "Amount", "Channel", "Date", "ETA", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const s = STATUS_MAP[o.status];
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid rgba(59,130,246,0.05)", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.85rem 1rem", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem" }}>{o.id}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#e8eaf0", fontFamily: "'Inter',sans-serif", fontSize: "0.82rem" }}>{o.customer}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.78rem" }}>{o.items}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#F59E0B", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>{o.amount}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    {o.channel === "whatsapp"
                      ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#25D366", fontSize: "0.72rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}><MessageCircle size={12} /> WhatsApp</span>
                      : <span style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>Manual</span>}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#4B5563", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem" }}>{o.date}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#8892a4", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem" }}>{o.eta}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "3px 8px", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>
                      {s.icon} {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
