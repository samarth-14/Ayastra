content = '''import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Truck, Clock, CheckCircle, X, Trash2 } from "lucide-react";
import { getOrders, createOrder, getCustomers, getProducts, createCustomer } from "../../../api";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", processing: "#8B5CF6",
  dispatched: "#22C55E", delivered: "#4B5563",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", processing: "Processing",
  dispatched: "Dispatched", delivered: "Delivered",
};

const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(11,17,32,0.9)", border: "1px solid rgba(59,130,246,0.2)",
  borderRadius: 8, padding: "0.5rem 0.75rem", color: "#e8eaf0",
  fontSize: "0.83rem", outline: "none", width: "100%", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  color: "#8892a4", fontSize: "0.75rem", fontWeight: 600, marginBottom: 4, display: "block",
};

export function DashboardOrders() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [custSearch, setCustSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [addingNewCust, setAddingNewCust] = useState(false);
  const [channel, setChannel] = useState("direct");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1, unit_price: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { setOrders([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openModal = async () => {
    setShowModal(true); setError(""); setSelectedCustomer(null);
    setCustSearch(""); setNewCustName(""); setNewCustPhone("");
    setAddingNewCust(false);
    setItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
    setChannel("direct"); setNotes("");
    try {
      const [c, p] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p : []);
    } catch (e) { console.error(e); }
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: any) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    if (field === "product_id") {
      const prod = products.find((p: any) => String(p.id) === String(val));
      if (prod?.cost_price) updated[i].unit_price = prod.cost_price;
    }
    setItems(updated);
  };

  const total = items.reduce((s, it) => s + Number(it.quantity) * Number(it.unit_price), 0);

  const handleSubmit = async () => {
    setError("");
    let customerId = selectedCustomer?.id;
    if (addingNewCust) {
      if (!newCustName.trim()) { setError("Enter customer name"); return; }
      try {
        const nc = await createCustomer({
          name: newCustName, phone: newCustPhone,
          company_id: Number(localStorage.getItem("company_id") || "1")
        });
        customerId = nc.id;
      } catch { setError("Failed to create customer"); return; }
    }
    if (!customerId) { setError("Select or add a customer"); return; }
    if (items.some(it => !it.product_id)) { setError("Select a product for each line item"); return; }
    if (items.some(it => Number(it.quantity) <= 0)) { setError("Quantity must be > 0"); return; }
    try {
      setSubmitting(true);
      await createOrder({
        customer_id: customerId,
        company_id: Number(localStorage.getItem("company_id") || "1"),
        channel, notes,
        items: items.map(it => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      });
      setShowModal(false);
      fetchOrders();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create order");
    } finally { setSubmitting(false); }
  };

  const filtered = orders.filter((o) => {
    const m = (o.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
              (o.customer || "").toLowerCase().includes(search.toLowerCase());
    return (filter === "all" || o.status === filter) && m;
  });

  const filteredCustomers = customers.filter((c: any) =>
    (c.name || "").toLowerCase().includes(custSearch.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const color = STATUS_COLORS[status] || "#F59E0B";
    const label = STATUS_LABELS[status] || status;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color, background: color + "18", border: "1px solid " + color + "40", borderRadius: 6, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700 }}>
        {status === "dispatched" ? <Truck size={12} /> : status === "delivered" ? <CheckCircle size={12} /> : <Clock size={12} />}
        {label}
      </span>
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Orders</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem" }}>{loading ? "Loading..." : orders.length + " total orders"}</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={openModal}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", border: "none", borderRadius: 10, padding: "0.6rem 1.25rem", fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> New Order
        </motion.button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {["all","pending","confirmed","processing","dispatched","delivered"].map((f) => {
          const color = STATUS_COLORS[f] || "#F59E0B";
          const label = f === "all" ? "All Orders" : STATUS_LABELS[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter===f ? color+"18" : "rgba(11,17,32,0.8)", border: "1px solid " + (filter===f ? color+"50" : "rgba(59,130,246,0.12)"), borderRadius: 8, padding: "0.4rem 0.85rem", color: filter===f ? color : "#8892a4", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem" }}>
              {label}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..."
            style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "0.4rem 0.75rem 0.4rem 2rem", color: "#e8eaf0", fontSize: "0.82rem", outline: "none", width: 200 }} />
        </div>
      </div>

      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              {["Order ID","Customer","Amount","Status","Date"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#4B5563", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign:"center", padding:"3rem", color:"#4B5563" }}>Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign:"center", padding:"3rem", color:"#4B5563" }}>No orders yet. Create your first order!</td></tr>
            ) : filtered.map((o, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(59,130,246,0.05)", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background="rgba(59,130,246,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}>
                <td style={{ padding:"0.85rem 1rem", color:"#3B82F6", fontFamily:"monospace", fontSize:"0.78rem" }}>{o.order_number||o.id}</td>
                <td style={{ padding:"0.85rem 1rem", color:"#e8eaf0", fontSize:"0.82rem" }}>{o.customer||"N/A"}</td>
                <td style={{ padding:"0.85rem 1rem", color:"#F59E0B", fontWeight:700, fontSize:"0.85rem" }}>Rs.{(o.total_amount||0).toLocaleString()}</td>
                <td style={{ padding:"0.85rem 1rem" }}><StatusBadge status={o.status||"pending"} /></td>
                <td style={{ padding:"0.85rem 1rem", color:"#4B5563", fontFamily:"monospace", fontSize:"0.72rem" }}>{o.order_date||"-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
            onClick={(e) => { if (e.target===e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              style={{ background:"#0d1424", border:"1px solid rgba(59,130,246,0.2)", borderRadius:18, padding:"1.75rem", width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
                <h3 style={{ fontFamily:"Space Grotesk,sans-serif", fontWeight:700, color:"#e8eaf0", fontSize:"1.1rem" }}>New Order</h3>
                <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#4B5563" }}><X size={20} /></button>
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={LABEL_STYLE}>Customer</label>
                {!addingNewCust ? (
                  <>
                    <input value={custSearch} onChange={(e) => { setCustSearch(e.target.value); setSelectedCustomer(null); }}
                      placeholder="Search customer..." style={INPUT_STYLE} />
                    {custSearch && !selectedCustomer && (
                      <div style={{ background:"#0b1120", border:"1px solid rgba(59,130,246,0.2)", borderRadius:8, marginTop:4, maxHeight:140, overflowY:"auto" }}>
                        {filteredCustomers.length===0 ? (
                          <div style={{ padding:"0.6rem 0.75rem", color:"#4B5563", fontSize:"0.8rem" }}>No customers found</div>
                        ) : filteredCustomers.map((c:any) => (
                          <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustSearch(c.name); }}
                            style={{ padding:"0.6rem 0.75rem", color:"#e8eaf0", fontSize:"0.82rem", cursor:"pointer", borderBottom:"1px solid rgba(59,130,246,0.08)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background="rgba(59,130,246,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}>
                            {c.name}{c.phone ? " - " + c.phone : ""}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCustomer && <div style={{ marginTop:6, color:"#22C55E", fontSize:"0.78rem" }}>Selected: {selectedCustomer.name}</div>}
                    <button onClick={() => setAddingNewCust(true)}
                      style={{ marginTop:8, background:"none", border:"none", color:"#3B82F6", fontSize:"0.78rem", cursor:"pointer", padding:0 }}>
                      + Add new customer
                    </button>
                  </>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <input value={newCustName} onChange={(e) => setNewCustName(e.target.value)} placeholder="Customer name *" style={INPUT_STYLE} />
                    <input value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} placeholder="Phone (optional)" style={INPUT_STYLE} />
                    <button onClick={() => setAddingNewCust(false)}
                      style={{ background:"none", border:"none", color:"#4B5563", fontSize:"0.78rem", cursor:"pointer", textAlign:"left", padding:0 }}>
                      Back to search
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={LABEL_STYLE}>Items</label>
                {items.map((item, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px 32px", gap:6, marginBottom:8, alignItems:"center" }}>
                    <select value={item.product_id} onChange={(e) => updateItem(i,"product_id",e.target.value)}
                      style={{ ...INPUT_STYLE, background:"#0b1120" }}>
                      <option value="">Select product</option>
                      {products.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i,"quantity",e.target.value)} placeholder="Qty" style={INPUT_STYLE} />
                    <input type="number" min="0" value={item.unit_price} onChange={(e) => updateItem(i,"unit_price",e.target.value)} placeholder="Price" style={INPUT_STYLE} />
                    <button onClick={() => removeItem(i)} disabled={items.length===1}
                      style={{ background:"none", border:"none", cursor:items.length===1?"not-allowed":"pointer", color:items.length===1?"#2a3244":"#EF4444", padding:0 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <button onClick={addItem}
                  style={{ background:"rgba(59,130,246,0.08)", border:"1px dashed rgba(59,130,246,0.3)", borderRadius:8, padding:"0.4rem 0.75rem", color:"#3B82F6", fontSize:"0.78rem", cursor:"pointer", width:"100%" }}>
                  + Add Item
                </button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.25rem" }}>
                <div>
                  <label style={LABEL_STYLE}>Channel</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value)} style={{ ...INPUT_STYLE, background:"#0b1120" }}>
                    <option value="direct">Direct</option>
                    <option value="online">Online</option>
                    <option value="distributor">Distributor</option>
                    <option value="export">Export</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Notes</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" style={INPUT_STYLE} />
                </div>
              </div>

              <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, padding:"0.75rem 1rem", marginBottom:"1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:"#8892a4", fontSize:"0.85rem" }}>Total Amount</span>
                <span style={{ color:"#F59E0B", fontWeight:700, fontSize:"1.1rem", fontFamily:"Space Grotesk,sans-serif" }}>Rs.{total.toLocaleString()}</span>
              </div>

              {error && <div style={{ color:"#EF4444", fontSize:"0.8rem", marginBottom:"1rem" }}>{error}</div>}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setShowModal(false)}
                  style={{ flex:1, background:"rgba(11,17,32,0.8)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, padding:"0.65rem", color:"#8892a4", cursor:"pointer", fontWeight:600 }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleSubmit} disabled={submitting}
                  style={{ flex:2, background:"linear-gradient(135deg,#3B82F6,#1D4ED8)", border:"none", borderRadius:10, padding:"0.65rem", color:"#fff", cursor:submitting?"not-allowed":"pointer", fontWeight:700, fontFamily:"Space Grotesk,sans-serif", opacity:submitting?0.7:1 }}>
                  {submitting ? "Creating..." : "Create Order"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
'''

with open('../frontend/src/app/components/dashboard/DashboardOrders.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")