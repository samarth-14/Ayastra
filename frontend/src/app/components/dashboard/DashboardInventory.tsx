import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, Plus, AlertTriangle, Package } from "lucide-react";
import { getInventory, getInventoryKPIs } from "../../../api";

const ITEMS = [
  { name: "Steel Billets 100mm", sku: "STL-B100", warehouse: "Mumbai Main", qty: 2840, unit: "MT", cost: "₹46,200/MT", val: "₹1.31Cr", status: "ok", reorder: 500 },
  { name: "Copper Rods 8mm", sku: "COP-R008", warehouse: "Pune Annex", qty: 156, unit: "MT", cost: "₹7,82,000/MT", val: "₹1.22Cr", status: "low", reorder: 200 },
  { name: "Aluminium Sheets 3mm", sku: "ALU-S003", warehouse: "Mumbai Main", qty: 890, unit: "MT", cost: "₹2,16,000/MT", val: "₹1.92Cr", status: "ok", reorder: 150 },
  { name: "Zinc Ingots", sku: "ZNC-I001", warehouse: "Delhi North", qty: 44, unit: "MT", cost: "₹2,39,000/MT", val: "₹10.5L", status: "critical", reorder: 100 },
  { name: "MS Angles 50x50", sku: "MSA-5050", warehouse: "Mumbai Main", qty: 1200, unit: "MT", cost: "₹48,000/MT", val: "₹5.76Cr", status: "ok", reorder: 200 },
  { name: "HR Coils 3mm", sku: "HRC-003", warehouse: "Surat Hub", qty: 320, unit: "MT", cost: "₹52,000/MT", val: "₹1.66Cr", status: "ok", reorder: 100 },
  { name: "Lead Ingots", sku: "PB-I001", warehouse: "Delhi North", qty: 88, unit: "MT", cost: "₹1,85,000/MT", val: "₹16.3L", status: "low", reorder: 120 },
  { name: "SS Sheets 304", sku: "SS-304", warehouse: "Pune Annex", qty: 42, unit: "MT", cost: "₹3,20,000/MT", val: "₹13.4L", status: "low", reorder: 60 },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ok: { label: "In Stock", color: "#22C55E" },
  low: { label: "Low Stock", color: "#F59E0B" },
  critical: { label: "Critical", color: "#EF4444" },
};

interface KPI {
  label: string;
  value: string | number;
  color: string;
}

interface InventoryItem {
  id?: string;
  name: string;
  sku: string;
  warehouse: string;
  qty: number;
  unit: string;
  cost: string;
  val: string;
  status: "ok" | "low" | "critical";
  reorder: number;
}

export function DashboardInventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState<InventoryItem[]>(ITEMS);
  const [kpis, setKpis] = useState<KPI[]>([
    { label: "Total SKUs", value: "2,847", color: "#3B82F6" },
    { label: "Inventory Value", value: "₹8.4Cr", color: "#F59E0B" },
    { label: "Low Stock", value: "18", color: "#F59E0B" },
    { label: "Critical", value: "3", color: "#EF4444" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inventoryData, kpiData] = await Promise.all([
          getInventory(),
          getInventoryKPIs(),
        ]);

        if (inventoryData && Array.isArray(inventoryData)) {
          setItems(inventoryData);
        }

        if (kpiData) {
          const formattedKpis = [
            {
              label: "Total SKUs",
              value: kpiData.total_skus || "2,847",
              color: "#3B82F6",
            },
            {
              label: "Inventory Value",
              value: kpiData.total_value || "₹8.4Cr",
              color: "#F59E0B",
            },
            {
              label: "Low Stock",
              value: kpiData.low_stock_count || "18",
              color: "#F59E0B",
            },
            {
              label: "Critical",
              value: kpiData.critical_count || "3",
              color: "#EF4444",
            },
          ];
          setKpis(formattedKpis);
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = ITEMS.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Inventory Manager</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif" }}>{items.length} SKUs {loading ? "loading..." : "across warehouses"}</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#050816", border: "none", borderRadius: 10, padding: "0.6rem 1.25rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> Add SKU
        </motion.button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "rgba(11,17,32,0.9)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 12, padding: "1rem 1.1rem", opacity: loading ? 0.6 : 1 }}>
            <div style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{k.label}</div>
            <div style={{ color: k.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>{loading ? "..." : k.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            style={{ width: "100%", background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: "0.55rem 0.75rem 0.55rem 2.25rem", color: "#e8eaf0", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["all", "ok", "low", "critical"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? "rgba(245,158,11,0.15)" : "rgba(11,17,32,0.8)", border: `1px solid ${filter === f ? "rgba(245,158,11,0.4)" : "rgba(59,130,246,0.15)"}`, borderRadius: 8, padding: "0.5rem 0.85rem", color: filter === f ? "#F59E0B" : "#8892a4", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.75rem", textTransform: "capitalize" }}>
              {f === "all" ? "All" : STATUS_MAP[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              {["Product", "SKU", "Warehouse", "Quantity", "Cost Price", "Total Value", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#4B5563", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const s = STATUS_MAP[item.status];
              const pct = (item.qty / item.reorder) * 100;
              return (
                <tr key={item.sku} style={{ borderBottom: "1px solid rgba(59,130,246,0.05)", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {item.status !== "ok" && <AlertTriangle size={12} style={{ color: s.color }} />}
                      <span style={{ color: "#e8eaf0", fontSize: "0.82rem", fontFamily: "'Inter',sans-serif" }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#4B5563", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>{item.sku}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#8892a4", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>{item.warehouse}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{item.qty.toLocaleString()} {item.unit}</div>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 2, height: 3, marginTop: 4 }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: s.color, borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#8892a4", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>{item.cost}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#F59E0B", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{item.val}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 6, padding: "2px 8px", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#4B5563", fontFamily: "'Inter',sans-serif" }}>No items match your search.</div>
        )}
      </motion.div>
    </div>
  );
}
