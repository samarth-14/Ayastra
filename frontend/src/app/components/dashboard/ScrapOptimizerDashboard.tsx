import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, Activity, Upload, Users, Tag, Recycle, ShoppingCart,
  CheckCircle2, Package, Loader2, MapPin, Clock, FileText,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import {
  getScrapListings, getBuyerOffers, getMarketplaceAnalytics, getBestBuyerRate,
  type ScrapListing, type BuyerOffer, type MarketplaceAnalytics, type MarketplaceActivityMetal,
  type BestBuyerRate,
} from "../../../api/api";
import { UploadScrapModal } from "../marketplace/UploadScrapModal";
import { CreateBuyingOfferModal } from "../marketplace/CreateBuyingOfferModal";
import { FindBuyersModal } from "../marketplace/FindBuyersModal";

/* ── Shared card style (matches Markets / Analytics / Inventory) ── */
const CARD: React.CSSProperties = {
  background: "rgba(11,17,32,0.8)",
  border: "1px solid rgba(59,130,246,0.12)",
  borderRadius: 16,
  padding: "1.25rem",
};

const GREEN = "#22C55E";
const BLUE = "#3B82F6";
const RED = "#EF4444";

/* ── Premium forecast visuals (Scrap Optimizer analytics — kept as-is) ── */
const SUMMARY = [
  { label: "Best Buyer's Rate", value: "₹7,84,500", sub: "+1.2% vs market", up: true, color: GREEN },
  { label: "Recommended Selling Window", value: "In 2 days", sub: "Optimal price window", up: true, color: "#F59E0B" },
  { label: "AI Confidence", value: "94%", sub: "High certainty", up: true, color: "#3B82F6" },
  { label: "Estimated Extra Profit", value: "+₹18,400", sub: "+2.4% upside", up: true, color: GREEN },
];
function readRole(): "seller" | "buyer" | "both" {
  const r = localStorage.getItem("marketplace_role");
  return r === "buyer" || r === "both" ? r : "seller";
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginBottom: "0.85rem" }}>
      {children}
    </div>
  );
}

function RoleHeader({ accent, icon, title, subtitle }: { accent: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}1f`, border: `1px solid ${accent}44`, color: accent, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>{title}</div>
        <div style={{ color: "#8892a4", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>{subtitle}</div>
      </div>
    </div>
  );
}

function ActionButton({ accent, icon, label, onClick }: { accent: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 12, padding: "0.85rem 1rem", cursor: "pointer", color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem", transition: "border-color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.12)")}
    >
      <span style={{ color: accent }}>{icon}</span>
      {label}
    </motion.button>
  );
}

/* Empty state for the "my listings/offers" strips (distinct from Find Buyers). */
function InlineEmpty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "1rem", background: "rgba(5,8,22,0.5)", border: "1px dashed rgba(59,130,246,0.18)", borderRadius: 12, color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif" }}>
      <span style={{ color: "#4B5563" }}>{icon}</span> {text}
    </div>
  );
}

function ListingRow({ l }: { l: ScrapListing }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "0.8rem 1rem", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {l.images[0]
          ? <img src={l.images[0]} alt={l.metal} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Recycle size={18} color={GREEN} /></div>}
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.88rem" }}>{l.metal}{l.grade ? ` · ${l.grade}` : ""}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>
            {(l.city || l.state) && <><MapPin size={10} /> {[l.city, l.state].filter(Boolean).join(", ")}</>}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>{l.quantity} {l.unit}</div>
        <div style={{ color: GREEN, fontSize: "0.62rem", fontFamily: "'JetBrains Mono',monospace" }}>● Live</div>
      </div>
    </div>
  );
}

function OfferRow({ o }: { o: BuyerOffer }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "0.8rem 1rem", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.88rem" }}>{o.metal}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>
          <Clock size={10} /> {o.settlement_time || "Negotiable"}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: BLUE, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>₹{o.buying_price.toLocaleString("en-IN")}<span style={{ color: "#4B5563", fontSize: "0.6rem" }}> /{o.unit}</span></div>
        <div style={{ color: "#8892a4", fontSize: "0.62rem", fontFamily: "'JetBrains Mono',monospace" }}>{o.quantity} {o.unit}</div>
      </div>
    </div>
  );
}

/* Success toast */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}
      style={{ position: "fixed", bottom: 28, left: "50%", zIndex: 1100, display: "flex", alignItems: "center", gap: 10, background: "rgba(11,17,32,0.98)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 12, padding: "0.75rem 1.15rem", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
    >
      <CheckCircle2 size={18} color={GREEN} />
      <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{message}</span>
    </motion.div>
  );
}

/* ── Scrap Optimizer trend chart (real marketplace data) ── */
const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type ChartPoint = {
  label: string;
  date: string;
  purchaseValue: number;
  saleValue: number;
  purchaseMetals: MarketplaceActivityMetal[];
  saleMetals: MarketplaceActivityMetal[];
};

const CHART_META = {
  buyer: { title: "Scrap Bought Trend — Last 7 Days", subtitle: "Track your scrap purchases across all metals." },
  seller: { title: "Scrap Sold Trend — Last 7 Days", subtitle: "Track your scrap sales across all metals." },
  both: { title: "Scrap Trading Activity — Last 7 Days", subtitle: "Track both your buying and selling activity." },
} as const;

const EMPTY_TEXT = {
  buyer: ["No scrap purchases yet.", "Your purchase history will appear here once you start buying scrap."],
  seller: ["No scrap sales yet.", "Your selling history will appear here after your first successful sale."],
  both: ["No marketplace activity yet.", "Your buying and selling history will appear here."],
} as const;

function MetalBreakdown({ title, color, metals }: { title: string; color: string; metals: MarketplaceActivityMetal[] }) {
  if (!metals.length) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ color, fontSize: "0.66rem", fontFamily: "'JetBrains Mono',monospace", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>{title}</div>
      {metals.map((m) => (
        <div key={m.metal} style={{ color: "#c7cdd9", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>
          {m.metal}: {m.quantity} {m.unit} · ₹{Math.round(m.price).toLocaleString("en-IN")}/{m.unit} · <span style={{ color: "#e8eaf0", fontWeight: 600 }}>{INR(m.value)}</span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, role }: { active?: boolean; payload?: any[]; role: "buyer" | "seller" | "both" }) {
  if (!active || !payload || !payload.length) return null;
  const p: ChartPoint = payload[0].payload;
  const showBuy = role === "buyer" || role === "both";
  const showSell = role === "seller" || role === "both";
  const nothing = (!showBuy || !p.purchaseMetals.length) && (!showSell || !p.saleMetals.length);
  return (
    <div style={{ background: "rgba(11,17,32,0.98)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, padding: "0.65rem 0.8rem", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", minWidth: 190 }}>
      <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.8rem" }}>{p.date}</div>
      {showBuy && <MetalBreakdown title="Purchased" color={GREEN} metals={p.purchaseMetals} />}
      {showSell && <MetalBreakdown title="Sold" color={RED} metals={p.saleMetals} />}
      {nothing && <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginTop: 4 }}>No activity</div>}
    </div>
  );
}

function ChartEmpty({ role }: { role: "buyer" | "seller" | "both" }) {
  const [head, body] = EMPTY_TEXT[role];
  return (
    <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 6, border: "1px dashed rgba(59,130,246,0.18)", borderRadius: 12, background: "rgba(5,8,22,0.4)" }}>
      <TrendingUp size={22} color="#4B5563" />
      <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>{head}</div>
      <div style={{ color: "#8892a4", fontFamily: "'Inter',sans-serif", fontSize: "0.78rem", maxWidth: 320 }}>{body}</div>
    </div>
  );
}

function pctChange(vals: number[]): number | null {
  const nz = vals.filter((v) => v > 0);
  if (nz.length < 2) return null;
  const first = nz[0];
  return first ? ((nz[nz.length - 1] - first) / first) * 100 : null;
}

export function ScrapOptimizerDashboard() {
  const role = readRole();
  const isSeller = role === "seller" || role === "both";
  const isBuyer = role === "buyer" || role === "both";
  const isBuyerOnly = role === "buyer"; // buyer-only: strip seller/AI cards, chart goes full-width
  const roleLabel = role === "both" ? "Buyer & Seller" : role === "buyer" ? "Buyer" : "Seller";
  const roleTone = role === "buyer" ? BLUE : role === "both" ? "#A855F7" : GREEN;
  const myUserId = Number(localStorage.getItem("user_id") || 0);

  const [modal, setModal] = useState<null | "upload" | "offer" | "findBuyers">(null);
  const [toast, setToast] = useState<string | null>(null);

  const [listings, setListings] = useState<ScrapListing[]>([]);
  const [myOffers, setMyOffers] = useState<BuyerOffer[]>([]);
  const [analytics, setAnalytics] = useState<MarketplaceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [bestRate, setBestRate] = useState<BestBuyerRate | null>(null);
  const [loading, setLoading] = useState(true);

  // Real data only — refetched on mount and after every publish.
  const refresh = useCallback(async () => {
    setLoading(true);
    setAnalyticsLoading(true);
    try {
      const [ls, offs, an, br] = await Promise.all([
        isSeller ? getScrapListings(true) : Promise.resolve([] as ScrapListing[]),
        isBuyer ? getBuyerOffers() : Promise.resolve([] as BuyerOffer[]),
        getMarketplaceAnalytics().catch(() => null),
        getBestBuyerRate().catch(() => null),
      ]);
      setListings(ls);
      setMyOffers(offs.filter((o) => o.buyer_id === myUserId));
      setAnalytics(an);
      setBestRate(br);
    } catch {
      /* keep prior data; sections show empty states */
    } finally {
      setLoading(false);
      setAnalyticsLoading(false);
    }
  }, [isSeller, isBuyer, myUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handlePublished = (msg: string) => {
    setModal(null);
    setToast(msg);
    refresh(); // new listing/offer appears immediately
  };

  // ── Real trend chart data (aggregated by day across all metals) ──
  const chartMeta = CHART_META[role];
  const purchaseSeries = analytics?.purchases.series ?? [];
  const saleSeries = analytics?.sales.series ?? [];
  const purchaseCount = analytics?.purchases.count ?? 0;
  const saleCount = analytics?.sales.count ?? 0;
  const baseSeries = purchaseSeries.length ? purchaseSeries : saleSeries;
  const chartData: ChartPoint[] = baseSeries.map((_, i) => ({
    label: baseSeries[i].label,
    date: baseSeries[i].date,
    purchaseValue: purchaseSeries[i]?.total ?? 0,
    saleValue: saleSeries[i]?.total ?? 0,
    purchaseMetals: purchaseSeries[i]?.metals ?? [],
    saleMetals: saleSeries[i]?.metals ?? [],
  }));
  const chartEmpty = role === "buyer" ? purchaseCount === 0
    : role === "seller" ? saleCount === 0
    : purchaseCount === 0 && saleCount === 0;
  const trendPct = pctChange(
    chartData.map((p) => role === "buyer" ? p.purchaseValue : role === "seller" ? p.saleValue : p.purchaseValue + p.saleValue),
  );

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 }}>Scrap Optimizer</h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem", fontFamily: "'Inter',sans-serif" }}>AI-powered buyer matching and selling recommendations.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: roleTone, fontSize: "0.72rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, background: `${roleTone}1a`, border: `1px solid ${roleTone}40`, borderRadius: 8, padding: "4px 10px" }}>{roleLabel}</span>
          <span style={{ color: GREEN, fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, padding: "4px 10px" }}>● LIVE</span>
        </div>
      </div>

      {/* ── Summary cards (premium forecast visuals) — hidden for buyer-only accounts ── */}
      {!isBuyerOnly && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
          {SUMMARY.map((s) => {
            // "Best Buyer's Rate" is driven by the highest active buyer offer
            // (buyer_prices); the remaining cards keep their forecast visuals.
            const isBest = s.label === "Best Buyer's Rate";
            const hasRate = bestRate?.best_rate != null;
            const value = !isBest
              ? s.value
              : loading
                ? "…"
                : hasRate
                  ? `₹${Math.round(bestRate!.best_rate!).toLocaleString("en-IN")}`
                  : "—";
            const sub = !isBest
              ? s.sub
              : hasRate
                ? `${bestRate!.metal} · per ${bestRate!.unit}`
                : "No active buyer offers yet";
            return (
              <motion.div key={s.label} whileHover={{ scale: 1.02 }} style={CARD}>
                <div style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>{s.label}</div>
                <div style={{ color: s.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.4rem" }}>{value}</div>
                <div style={{ color: isBest && !hasRate ? "#8892a4" : s.up ? "#22C55E" : "#EF4444", fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>{sub}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Market Trend (+ AI Recommendation for non-buyer-only) ── */}
      {/* Buyer-only: chart collapses to one full-width card; no empty column. */}
      <div style={{ display: "grid", gridTemplateColumns: isBuyerOnly ? "1fr" : "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={CARD}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{chartMeta.title}</div>
              <div style={{ color: "#8892a4", fontSize: "0.74rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{chartMeta.subtitle}</div>
            </div>
            {!chartEmpty && trendPct !== null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: trendPct >= 0 ? GREEN : RED, fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>
                <TrendingUp size={12} /> {trendPct >= 0 ? "+" : ""}{trendPct.toFixed(1)}%
              </span>
            )}
          </div>
          {analyticsLoading ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif", gap: 8 }}>
              <Loader2 size={16} className="spin" /> Loading activity…
            </div>
          ) : chartEmpty ? (
            <ChartEmpty role={role} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
                <XAxis dataKey="label" tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`} />
                <Tooltip content={<ChartTooltip role={role} />} cursor={{ stroke: "rgba(59,130,246,0.2)" }} />
                {(role === "buyer" || role === "both") && (
                  <Line type="monotone" dataKey="purchaseValue" name="Purchased" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 3 }} activeDot={{ r: 6 }} />
                )}
                {(role === "seller" || role === "both") && (
                  <Line type="monotone" dataKey="saleValue" name="Sold" stroke={role === "seller" ? GREEN : RED} strokeWidth={2.5} dot={{ fill: role === "seller" ? GREEN : RED, r: 3 }} activeDot={{ r: 6 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {!isBuyerOnly && (
          <div style={{ ...CARD, border: "1px solid rgba(245,158,11,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
              <Activity size={16} style={{ color: "#F59E0B" }} />
              <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>AI Recommendation</span>
            </div>
            <div style={{ color: "#F59E0B", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.6rem", marginBottom: "1rem" }}>Wait 2 Days</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "0.75rem" }}>
                <div style={{ color: "#8892a4", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>Expected Gain</div>
                <div style={{ color: "#22C55E", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>+2.4%</div>
              </div>
              <div style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "0.75rem" }}>
                <div style={{ color: "#8892a4", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>Confidence</div>
                <div style={{ color: "#F59E0B", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>94%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Seller marketplace (real data) ── */}
      {isSeller && (
        <div style={{ ...CARD, marginBottom: "1rem", border: `1px solid ${GREEN}26` }}>
          <RoleHeader accent={GREEN} icon={<Recycle size={20} />} title="Seller Marketplace" subtitle="List scrap and reach verified buyers." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <ActionButton accent={GREEN} icon={<Upload size={18} />} label="Upload Scrap" onClick={() => setModal("upload")} />
            <ActionButton accent={GREEN} icon={<Users size={18} />} label="Find Buyers" onClick={() => setModal("findBuyers")} />
          </div>
          <SectionTitle>My Scrap Listings</SectionTitle>
          {loading ? (
            <InlineEmpty icon={<Loader2 size={16} className="spin" />} text="Loading your listings…" />
          ) : listings.length === 0 ? (
            <InlineEmpty icon={<Package size={16} />} text="No scrap listed yet. Click “Upload Scrap” to publish your first listing." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {listings.map((l) => <ListingRow key={l.id} l={l} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Buyer marketplace (real data) ── */}
      {isBuyer && (
        <div style={{ ...CARD, marginBottom: "1rem", border: `1px solid ${BLUE}26` }}>
          <RoleHeader accent={BLUE} icon={<ShoppingCart size={20} />} title="Buyer Marketplace" subtitle="Publish buying offers and source scrap." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <ActionButton accent={BLUE} icon={<Tag size={18} />} label="Create Buying Offer" onClick={() => setModal("offer")} />
          </div>
          <SectionTitle>My Buying Offers</SectionTitle>
          {loading ? (
            <InlineEmpty icon={<Loader2 size={16} className="spin" />} text="Loading your offers…" />
          ) : myOffers.length === 0 ? (
            <InlineEmpty icon={<FileText size={16} />} text="No buying offers yet. Click “Create Buying Offer” to publish one." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {myOffers.map((o) => <OfferRow key={o.id} o={o} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <UploadScrapModal open={modal === "upload"} onClose={() => setModal(null)} onPublished={handlePublished} />
      <CreateBuyingOfferModal open={modal === "offer"} onClose={() => setModal(null)} onPublished={handlePublished} />
      <FindBuyersModal open={modal === "findBuyers"} onClose={() => setModal(null)} />

      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
