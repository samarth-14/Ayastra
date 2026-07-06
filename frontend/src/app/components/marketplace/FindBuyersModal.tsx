import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, X, MapPin, Clock, Wallet, Package, Loader2, Building2, Phone, ClipboardList } from "lucide-react";
import { getBuyerOffers, type BuyerOffer } from "../../../api/api";

const BLUE = "#3B82F6";
const GREEN = "#22C55E";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "3rem 1.5rem" }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 88, height: 88, borderRadius: 24, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
      >
        <Users size={40} color={BLUE} />
      </motion.div>
      <h3 style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.15rem", margin: "0 0 0.6rem" }}>
        No verified buyers have joined Ayastra Marketplace yet
      </h3>
      <p style={{ color: "#8892a4", fontSize: "0.88rem", fontFamily: "'Inter',sans-serif", lineHeight: 1.65, maxWidth: 380, margin: "0 auto" }}>
        As buyers publish their buying offers, they will automatically appear here. Check back soon.
      </p>
    </motion.div>
  );
}

function OfferCard({ o }: { o: BuyerOffer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 14, padding: "1rem", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
            <Building2 size={14} color={BLUE} /> {o.company_name || "Verified Buyer"}
          </div>
          {(o.company_address || o.city || o.state) && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginTop: 3 }}>
              <MapPin size={11} /> {[o.company_address, o.city, o.state].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        <span style={{ flexShrink: 0, color: BLUE, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, padding: "3px 9px", fontSize: "0.66rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{o.metal}</span>
      </div>

      {/* Price + quantity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "rgba(11,17,32,0.6)", borderRadius: 10, padding: "0.6rem 0.75rem" }}>
          <div style={{ color: "#8892a4", fontSize: "0.66rem", fontFamily: "'Inter',sans-serif" }}>Buying Price</div>
          <div style={{ color: GREEN, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem" }}>₹{o.buying_price.toLocaleString("en-IN")}<span style={{ color: "#4B5563", fontSize: "0.6rem" }}> /{o.unit}</span></div>
        </div>
        <div style={{ background: "rgba(11,17,32,0.6)", borderRadius: 10, padding: "0.6rem 0.75rem" }}>
          <div style={{ color: "#8892a4", fontSize: "0.66rem", fontFamily: "'Inter',sans-serif" }}>Preferred Qty</div>
          <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem" }}>{o.quantity} <span style={{ color: "#4B5563", fontSize: "0.6rem" }}>{o.unit}</span></div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
        {o.settlement_time && <Meta icon={<Clock size={12} />} label={o.settlement_time} />}
        {o.contact_number && <Meta icon={<Phone size={12} />} label={o.contact_number} />}
        {o.gst_number && <Meta icon={<Wallet size={12} />} label={`GST ${o.gst_number}`} />}
        {o.created_at && <Meta icon={<ClipboardList size={12} />} label={fmtDate(o.created_at)} />}
      </div>

      {o.notes && (
        <div style={{ color: "#8892a4", fontSize: "0.76rem", fontFamily: "'Inter',sans-serif", lineHeight: 1.5, borderLeft: `2px solid ${BLUE}44`, paddingLeft: 8 }}>{o.notes}</div>
      )}

      {o.images.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {o.images.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noreferrer">
              <img src={src} alt={`offer ${i + 1}`} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(59,130,246,0.15)" }} />
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif" }}>
      <span style={{ color: "#4B5563" }}>{icon}</span> {label}
    </div>
  );
}

export function FindBuyersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [offers, setOffers] = useState<BuyerOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError(null);
    getBuyerOffers()
      .then(setOffers)
      .catch(() => setError("Could not load buyer offers. Please try again."))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(3,6,16,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 720, maxHeight: "90vh", display: "flex", flexDirection: "column", background: "rgba(11,17,32,0.98)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}
          >
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.25rem", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: BLUE }}><Users size={20} /></div>
                <div>
                  <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem" }}>Find Buyers</div>
                  <div style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif" }}>{loading ? "Loading…" : `${offers.length} active buyer offer${offers.length === 1 ? "" : "s"}`}</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#8892a4", cursor: "pointer", padding: 4, display: "flex" }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "3rem", color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem" }}>
                  <Loader2 size={18} className="spin" /> Loading buyer offers…
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#EF4444", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem" }}>{error}</div>
              ) : offers.length === 0 ? (
                <EmptyState />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "0.9rem" }}>
                  {offers.map((o) => <OfferCard key={o.id} o={o} />)}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
