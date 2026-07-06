import { useState, useEffect } from "react";
import { Tag, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createBuyerOffer, getMarketplaceProfile } from "../../../api/api";
import { ImageDropzone, type DropImage } from "./ImageDropzone";
import { ModalShell, Field, TextInput, TextArea, Select, PrimaryButton, GhostButton } from "./ui";

const BLUE = "#3B82F6";
const METALS = ["Copper", "Aluminium", "Brass", "Steel", "Iron", "Lead", "Nickel", "Mixed Scrap"];
const UNITS = ["KG", "MT", "Ton"];
const SETTLEMENTS = ["Immediate", "Within 24 Hours", "Within 3 Days", "Within 7 Days", "Negotiable"];

export function CreateBuyingOfferModal({ open, onClose, onPublished }: {
  open: boolean;
  onClose: () => void;
  onPublished: (msg: string) => void;
}) {
  // Dynamic (per-offer) fields
  const [metal, setMetal] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("MT");
  const [settlement, setSettlement] = useState("Negotiable");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<DropImage[]>([]);

  // Prefilled company profile (editable, collapsed by default)
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gst, setGst] = useState("");
  const [contact, setContact] = useState("");
  const [showCompany, setShowCompany] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch the saved profile whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setLoadingProfile(true);
    getMarketplaceProfile()
      .then((p) => {
        setCompanyName(p.company_name || "");
        setCompanyAddress(p.company_address || "");
        setCity(p.city || "");
        setState(p.state || "");
        setGst(p.gst_number || "");
        setContact(p.contact_number || "");
      })
      .catch(() => { /* leave blank; user can fill manually */ })
      .finally(() => setLoadingProfile(false));
  }, [open]);

  const resetDynamic = () => {
    setMetal(""); setBuyingPrice(""); setQuantity(""); setUnit("MT");
    setSettlement("Negotiable"); setNotes(""); setImages([]); setError(null);
  };

  const handleClose = () => { if (!submitting) { resetDynamic(); onClose(); } };

  const handleSubmit = async () => {
    setError(null);
    if (!metal) return setError("Please select the required metal.");
    const price = parseFloat(buyingPrice);
    const qty = parseFloat(quantity);
    if (!price || price <= 0) return setError("Enter a valid buying price.");
    if (!qty || qty <= 0) return setError("Enter a valid quantity.");
    setSubmitting(true);
    try {
      await createBuyerOffer(
        {
          metal, buying_price: price, quantity: qty, unit,
          settlement_time: settlement, notes,
          company_name: companyName, company_address: companyAddress,
          city, state, gst_number: gst, contact_number: contact,
        },
        images.map((i) => i.file),
      );
      resetDynamic();
      onPublished("Buying offer published successfully.");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not publish the offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      accent={BLUE}
      icon={<Tag size={20} />}
      title="Create Buying Offer"
      subtitle="Publish what you want to buy"
      footer={
        <>
          <GhostButton onClick={handleClose}>Cancel</GhostButton>
          <PrimaryButton accent={BLUE} loading={submitting} onClick={handleSubmit}>
            {submitting ? <><Loader2 size={15} className="spin" /> Publishing…</> : "Publish Buying Offer"}
          </PrimaryButton>
        </>
      }
    >
      {error && <div style={{ color: "#EF4444", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>{error}</div>}

      {/* ── Dynamic per-offer fields ── */}
      <Field label="Metal Required" required>
        <Select value={metal} onChange={setMetal} options={METALS} placeholder="Select metal" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Preferred Buying Price" required>
          <TextInput type="number" min="0" step="any" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} placeholder="₹ per unit" />
        </Field>
        <Field label="Settlement Time">
          <Select value={settlement} onChange={setSettlement} options={SETTLEMENTS} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
        <Field label="Preferred Quantity" required>
          <TextInput type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 20" />
        </Field>
        <Field label="Preferred Unit" required>
          <Select value={unit} onChange={setUnit} options={UNITS} />
        </Field>
      </div>

      <Field label="Additional Notes">
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Quality expectations, delivery terms…" />
      </Field>

      <Field label="Upload Images">
        <ImageDropzone images={images} onChange={setImages} accent={BLUE} />
      </Field>

      {/* ── Prefilled company details (from onboarding profile, editable) ── */}
      <div style={{ borderTop: "1px solid rgba(59,130,246,0.1)", paddingTop: "0.9rem" }}>
        <button
          type="button"
          onClick={() => setShowCompany((s) => !s)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          <span style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
            {loadingProfile ? "Loading company details…" : "Company details"}
            <span style={{ color: "#4B5563", fontWeight: 400 }}> · auto-filled from your profile{loadingProfile ? "" : " · tap to edit"}</span>
          </span>
          {showCompany ? <ChevronUp size={16} color="#8892a4" /> : <ChevronDown size={16} color="#8892a4" />}
        </button>

        {showCompany && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.9rem" }}>
            <Field label="Company Name"><TextInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field>
            <Field label="Company Address"><TextInput value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="City"><TextInput value={city} onChange={(e) => setCity(e.target.value)} /></Field>
              <Field label="State"><TextInput value={state} onChange={(e) => setState(e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="GST Number"><TextInput value={gst} onChange={(e) => setGst(e.target.value)} /></Field>
              <Field label="Contact Number"><TextInput value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
            </div>
            <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif" }}>
              Edits here apply to this offer only. Update your saved profile in Settings → Company.
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
