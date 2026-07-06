import { useState } from "react";
import { Recycle, Loader2 } from "lucide-react";
import { createScrapListing } from "../../../api/api";
import { ImageDropzone, type DropImage } from "./ImageDropzone";
import { ModalShell, Field, TextInput, TextArea, Select, PrimaryButton, GhostButton } from "./ui";

const GREEN = "#22C55E";
const METALS = ["Copper", "Aluminium", "Brass", "Steel", "Iron", "Lead", "Nickel", "Mixed Scrap"];
const UNITS = ["KG", "MT", "Ton"];

export function UploadScrapModal({ open, onClose, onPublished }: {
  open: boolean;
  onClose: () => void;
  onPublished: (msg: string) => void;
}) {
  const [metal, setMetal] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("MT");
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [images, setImages] = useState<DropImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMetal(""); setQuantity(""); setUnit("MT"); setGrade("");
    setDescription(""); setCity(""); setState(""); setImages([]); setError(null);
  };

  const handleClose = () => { if (!submitting) { reset(); onClose(); } };

  const handleSubmit = async () => {
    setError(null);
    if (!metal) return setError("Please select a metal.");
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return setError("Enter a valid quantity.");
    setSubmitting(true);
    try {
      await createScrapListing(
        { metal, quantity: qty, unit, grade, description, city, state },
        images.map((i) => i.file),
      );
      reset();
      onPublished("Scrap listing published successfully.");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not publish the listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      accent={GREEN}
      icon={<Recycle size={20} />}
      title="Upload Scrap"
      subtitle="List scrap for verified buyers"
      footer={
        <>
          <GhostButton onClick={handleClose}>Cancel</GhostButton>
          <PrimaryButton accent={GREEN} loading={submitting} onClick={handleSubmit}>
            {submitting ? <><Loader2 size={15} className="spin" /> Publishing…</> : "Publish Scrap"}
          </PrimaryButton>
        </>
      }
    >
      {error && <div style={{ color: "#EF4444", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif" }}>{error}</div>}

      <Field label="Metal" required>
        <Select value={metal} onChange={setMetal} options={METALS} placeholder="Select metal" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
        <Field label="Scrap Quantity" required>
          <TextInput type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 12" />
        </Field>
        <Field label="Unit" required>
          <Select value={unit} onChange={setUnit} options={UNITS} />
        </Field>
      </div>

      <Field label="Scrap Grade">
        <TextInput value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 99.9% / HMS-1" />
      </Field>

      <Field label="Scrap Description">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, source, packaging…" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="City"><TextInput value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" /></Field>
        <Field label="State"><TextInput value={state} onChange={(e) => setState(e.target.value)} placeholder="Maharashtra" /></Field>
      </div>

      <Field label="Upload Images">
        <ImageDropzone images={images} onChange={setImages} accent={GREEN} />
      </Field>
    </ModalShell>
  );
}
