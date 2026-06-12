content = '''import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, MessageCircle, Truck, Clock, CheckCircle } from "lucide-react";
import { getOrders } from "../../../api";

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        if (data && Array.isArray(data)) setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const m = (o.order_number || o.id || "").toLowerCase().includes(search.toLowerCase()) ||
              (o.customer_name || o.customer || "").toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || o.status === filter;
    return m && f;
  });

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Orders</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem" }}>{loading ? "Loading..." : `${orders.length} total orders`}</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", border: "none", borderRadius: 10, padding: "0.6rem 1.25rem", fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> New Order
        </motion.button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {["all", "pending", "confirmed", "processing", "dispatched", "delivered"].map((f) => {
          const s = STATUS_MAP[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? (s ? `${s.color}18` : "rgba(245,158,11,0.12)") : "rgba(11,17,32,0.8)", border: `1px solid ${filter === f ? (s?.color ?? "#F59E0B") + "50" : "rgba(59,130,246,0.12)"}`, borderRadius: 8, padding: "0.4rem 0.85rem", color: filter === f ? (s?.color ?? "#F59E0B") : "#8892a4", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem" }}>
              {f === "all" ? "All Orders" : s?.label}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..."
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "0.4rem 0.75rem 0.4rem 2rem", color: "#e8eaf0", fontSize: "0.82rem", outline: "none", width: 200 }} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#4B5563", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#4B5563" }}>Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#4B5563" }}>No orders found.</td></tr>
            ) : filtered.map((o, i) => {
              const status = o.status || "pending";
              const s = STATUS_MAP[status] || STATUS_MAP["pending"];
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.05)", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.85rem 1rem", color: "#3B82F6", fontFamily: "monospace", fontSize: "0.78rem" }}>{o.order_number || o.id}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#e8eaf0", fontSize: "0.82rem" }}>{o.customer_name || o.customer || "N/A"}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#F59E0B", fontWeight: 700, fontSize: "0.85rem" }}>Rs.{o.total_amount || o.amount || 0}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700 }}>
                      {s.icon} {s.label}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#4B5563", fontFamily: "monospace", fontSize: "0.72rem" }}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : o.date || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
'''

with open('../frontend/src/app/components/dashboard/DashboardOrders.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")