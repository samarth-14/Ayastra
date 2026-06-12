content = '''import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { getInventory, getInventoryKPIs } from "../../../api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ok: { label: "In Stock", color: "#22C55E" },
  low: { label: "Low Stock", color: "#F59E0B" },
  critical: { label: "Critical", color: "#EF4444" },
};

export function DashboardInventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([
    { label: "Total SKUs", value: "...", color: "#3B82F6" },
    { label: "Inventory Value", value: "...", color: "#F59E0B" },
    { label: "Low Stock", value: "...", color: "#F59E0B" },
    { label: "Critical", value: "...", color: "#EF4444" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem("company_id") || "1";
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inventoryData, kpiData] = await Promise.all([
          getInventory(companyId),
          getInventoryKPIs(companyId),
        ]);
        if (inventoryData && Array.isArray(inventoryData)) setItems(inventoryData);
        if (kpiData) {
          setKpis([
            { label: "Total SKUs", value: kpiData.total_skus || 0, color: "#3B82F6" },
            { label: "Inventory Value", value: kpiData.total_value || 0, color: "#F59E0B" },
            { label: "Low Stock", value: kpiData.low_stock_count || 0, color: "#F59E0B" },
            { label: "Critical", value: kpiData.critical_count || 0, color: "#EF4444" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch = item.product_name?.toLowerCase().includes(search.toLowerCase()) || item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Inventory Manager</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem" }}>{loading ? "Loading..." : `${items.length} SKUs across warehouses`}</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#050816", border: "none", borderRadius: 10, padding: "0.6rem 1.25rem", fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> Add SKU
        </motion.button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "rgba(11,17,32,0.9)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 12, padding: "1rem 1.1rem" }}>
            <div style={{ color: "#8892a4", fontSize: "0.7rem", marginBottom: 4 }}>{k.label}</div>
            <div style={{ color: k.color, fontFamily: "Space Grotesk,sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>{loading ? "..." : k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..."
            style={{ width: "100%", background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: "0.55rem 0.75rem 0.55rem 2.25rem", color: "#e8eaf0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["all", "ok", "low", "critical"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? "rgba(245,158,11,0.15)" : "rgba(11,17,32,0.8)", border: `1px solid ${filter === f ? "rgba(245,158,11,0.4)" : "rgba(59,130,246,0.15)"}`, borderRadius: 8, padding: "0.5rem 0.85rem", color: filter === f ? "#F59E0B" : "#8892a4", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem", textTransform: "capitalize" }}>
              {f === "all" ? "All" : STATUS_MAP[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              {["Product", "SKU", "Warehouse", "Quantity", "Unit Cost", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#4B5563", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#4B5563" }}>Loading inventory...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#4B5563" }}>No items found.</td></tr>
            ) : filtered.map((item, i) => {
              const status = item.status || "ok";
              const s = STATUS_MAP[status] || STATUS_MAP["ok"];
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.05)", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {status !== "ok" && <AlertTriangle size={12} style={{ color: s.color }} />}
                      <span style={{ color: "#e8eaf0", fontSize: "0.82rem" }}>{item.product_name || item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#4B5563", fontSize: "0.72rem", fontFamily: "monospace" }}>{item.sku || "-"}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#8892a4", fontSize: "0.78rem" }}>{item.warehouse_name || item.warehouse || "-"}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "0.85rem" }}>{item.quantity_on_hand || item.qty || 0} {item.unit || "MT"}</div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#8892a4", fontSize: "0.78rem" }}>Rs.{item.unit_cost || item.cost || 0}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "2px 8px", fontSize: "0.7rem", fontWeight: 700 }}>{s.label}</span>
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
'''

with open('../frontend/src/app/components/dashboard/DashboardInventory.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")