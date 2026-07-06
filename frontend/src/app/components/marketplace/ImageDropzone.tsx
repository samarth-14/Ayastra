import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, X, ImageIcon } from "lucide-react";

/* Reusable image dropzone used by both marketplace modals.
   Matches the dashboard theme (navy cards, blue accents, Space Grotesk). */

const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface DropImage {
  file: File;
  preview: string;
}

export function ImageDropzone({
  images,
  onChange,
  accent = "#3B82F6",
}: {
  images: DropImage[];
  onChange: (next: DropImage[]) => void;
  accent?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const incoming = Array.from(fileList);
    const accepted: DropImage[] = [];
    for (const file of incoming) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`"${file.name}" is not a supported image (JPG, PNG, WEBP).`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" exceeds the 5MB limit.`);
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    const merged = [...images, ...accepted].slice(0, MAX_IMAGES);
    if (images.length + accepted.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images.`);
    }
    onChange(merged);
  };

  const removeAt = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    URL.revokeObjectURL(images[idx].preview);
    onChange(next);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        style={{
          cursor: "pointer",
          border: `1.5px dashed ${dragging ? accent : "rgba(59,130,246,0.28)"}`,
          background: dragging ? `${accent}12` : "rgba(5,8,22,0.5)",
          borderRadius: 14,
          padding: "1.4rem 1rem",
          textAlign: "center",
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => { addFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; }}
        />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, color: accent }}>
          <UploadCloud size={26} />
        </div>
        <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>
          Drag &amp; drop images here, or <span style={{ color: accent }}>browse files</span>
        </div>
        <div style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginTop: 4 }}>
          JPG · PNG · WEBP · up to 5MB each · max {MAX_IMAGES} images
        </div>
      </div>

      {error && (
        <div style={{ color: "#EF4444", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif", marginTop: 8 }}>{error}</div>
      )}

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 8, marginTop: 12 }}
          >
            {images.map((img, i) => (
              <motion.div
                key={img.preview}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <img src={img.preview} alt={`preview ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeAt(i); }}
                  style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(5,8,22,0.85)", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter',sans-serif", marginTop: 8 }}>
          <ImageIcon size={12} /> No images selected yet
        </div>
      )}
    </div>
  );
}

export { MAX_IMAGES };
