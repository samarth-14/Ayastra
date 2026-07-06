import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { submitOnboarding, type MarketplaceRole } from "../../api/api";

/* ── Role options ── */
const OPTIONS: {
  role: MarketplaceRole;
  emoji: string;
  title: string;
  description: string;
  accent: string;
}[] = [
  {
    role: "seller",
    emoji: "🟢",
    title: "Scrap Seller",
    description: "Sell your scrap inventory to verified buyers.",
    accent: "#22C55E",
  },
  {
    role: "buyer",
    emoji: "🔵",
    title: "Scrap Buyer",
    description: "Publish buying offers and connect with sellers.",
    accent: "#3B82F6",
  },
  {
    role: "both",
    emoji: "🟣",
    title: "Buyer & Seller",
    description: "Buy and sell scrap from a single account.",
    accent: "#A855F7",
  },
];

const FIELD_STYLE: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.15)",
  borderRadius: 12, padding: "0.7rem 0.9rem", color: "#e8eaf0", fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
};
const FIELD_LABEL: React.CSSProperties = {
  color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
  letterSpacing: "0.04em", display: "block", marginBottom: 6,
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<MarketplaceRole | null>(null);
  const [loading, setLoading] = useState(false);

  // Personal + company profile — collected once here so buyers never re-enter it
  // per offer. Full name is pre-filled from signup/Google but stays editable.
  const [profile, setProfile] = useState({
    full_name: localStorage.getItem("name") || "",
    company_name: "", company_address: "", city: "", state: "", gst_number: "", contact_number: "",
  });
  const setField = (k: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  const token = localStorage.getItem("token");
  const alreadyDone = localStorage.getItem("onboarding_completed") === "true";

  // Not signed in → send to login. Already onboarded → skip straight to dashboard.
  if (!token) return <Navigate to="/login" replace />;
  if (alreadyDone) return <Navigate to="/dashboard" replace />;

  const handleContinue = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await submitOnboarding(selected, profile);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Onboarding failed:", error);
      alert(error?.response?.data?.detail || "Could not save your selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#141C2E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(59,130,246,0.06) 0%, rgba(245,158,11,0.03) 40%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", width: "100%", maxWidth: "860px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.07)",
              color: "#F59E0B",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: "1.25rem",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22C55E" }} />
            PROFILE SETUP
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "0.6rem",
            }}
          >
            Welcome to Ayastra
          </h1>
          <p style={{ color: "#8892a4", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Tell us how you'd like to use the platform.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === opt.role;
            return (
              <motion.button
                key={opt.role}
                type="button"
                onClick={() => setSelected(opt.role)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  position: "relative",
                  textAlign: "left",
                  cursor: "pointer",
                  background: isSelected ? "rgba(11,17,32,0.95)" : "rgba(11,17,32,0.8)",
                  border: `1.5px solid ${isSelected ? opt.accent : "rgba(59,130,246,0.12)"}`,
                  borderRadius: 16,
                  padding: "1.5rem 1.25rem",
                  transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${opt.accent}, 0 12px 32px rgba(0,0,0,0.45), 0 0 40px ${opt.accent}22`
                    : "0 4px 14px rgba(0,0,0,0.2)",
                }}
              >
                {/* Check icon */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: opt.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={15} strokeWidth={3} color="#141C2E" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ fontSize: "2rem", marginBottom: "0.9rem", lineHeight: 1 }}>
                  {opt.emoji}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#e8eaf0",
                    marginBottom: "0.4rem",
                  }}
                >
                  {opt.title}
                </div>
                <div
                  style={{
                    color: "#8892a4",
                    fontSize: "0.82rem",
                    lineHeight: 1.55,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {opt.description}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Company details — revealed once a role is picked, saved to the profile */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Personal details — name pre-filled from signup, plus contact number */}
              <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.5rem" }}>
                <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 4 }}>Personal details</div>
                <div style={{ color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif", marginBottom: "1.25rem" }}>
                  Confirm your name and add a contact number buyers and sellers can reach you on.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                  <div>
                    <label style={FIELD_LABEL}>FULL NAME</label>
                    <input value={profile.full_name} onChange={setField("full_name")} placeholder="Rajesh Sharma" style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label style={FIELD_LABEL}>PHONE NUMBER</label>
                    <input value={profile.contact_number} onChange={setField("contact_number")} placeholder="+91 98765 43210" style={FIELD_STYLE} />
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.5rem" }}>
                <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 4 }}>Company details</div>
                <div style={{ color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif", marginBottom: "1.25rem" }}>
                  Saved to your profile so you never re-enter it when creating buying offers. You can edit it later in Settings.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  <div>
                    <label style={FIELD_LABEL}>COMPANY NAME</label>
                    <input value={profile.company_name} onChange={setField("company_name")} placeholder="Sharma Metals Pvt. Ltd." style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label style={FIELD_LABEL}>COMPANY ADDRESS</label>
                    <input value={profile.company_address} onChange={setField("company_address")} placeholder="12 Industrial Estate" style={FIELD_STYLE} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                    <div>
                      <label style={FIELD_LABEL}>CITY</label>
                      <input value={profile.city} onChange={setField("city")} placeholder="Mumbai" style={FIELD_STYLE} />
                    </div>
                    <div>
                      <label style={FIELD_LABEL}>STATE</label>
                      <input value={profile.state} onChange={setField("state")} placeholder="Maharashtra" style={FIELD_STYLE} />
                    </div>
                  </div>
                  <div>
                    <label style={FIELD_LABEL}>GST NUMBER <span style={{ color: "#4B5563", fontWeight: 400 }}>(optional)</span></label>
                    <input value={profile.gst_number} onChange={setField("gst_number")} placeholder="27ABCDE1234F1Z5" style={FIELD_STYLE} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.button
            type="button"
            onClick={handleContinue}
            disabled={!selected || loading}
            whileHover={selected && !loading ? { scale: 1.02 } : {}}
            whileTap={selected && !loading ? { scale: 0.98 } : {}}
            style={{
              minWidth: "260px",
              padding: "0.9rem 2rem",
              borderRadius: 12,
              border: "none",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "0.92rem",
              color: "#141C2E",
              background:
                !selected || loading
                  ? "rgba(245,158,11,0.35)"
                  : "linear-gradient(135deg,#F59E0B,#D97706)",
              cursor: !selected || loading ? "not-allowed" : "pointer",
              transition: "background 0.25s",
            }}
          >
            {loading ? "Saving..." : "Continue"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
