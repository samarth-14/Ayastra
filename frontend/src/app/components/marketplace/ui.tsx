import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

/* Shared marketplace-modal primitives — reuse the dashboard theme so the modals
   feel native (navy panels, blue/green accents, Space Grotesk / Inter). */

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(5,8,22,0.6)",
  border: "1px solid rgba(59,130,246,0.15)",
  borderRadius: 10,
  padding: "0.6rem 0.8rem",
  color: "#e8eaf0",
  fontFamily: "'Inter',sans-serif",
  fontSize: "0.85rem",
  outline: "none",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  color: "#8892a4",
  fontSize: "0.72rem",
  fontFamily: "'Space Grotesk',sans-serif",
  fontWeight: 600,
  letterSpacing: "0.03em",
  display: "block",
  marginBottom: 6,
};

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label.toUpperCase()} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 72, resize: "vertical", ...(props.style || {}) }} />;
}

export function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#0B1120" }}>{o}</option>
      ))}
    </select>
  );
}

export function ModalShell({ open, onClose, title, subtitle, accent, icon, children, footer }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accent: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
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
            style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", background: "rgba(11,17,32,0.98)", border: `1px solid ${accent}33`, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.25rem", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}1f`, border: `1px solid ${accent}44`, color: accent }}>{icon}</div>
                <div>
                  <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem" }}>{title}</div>
                  {subtitle && <div style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif" }}>{subtitle}</div>}
                </div>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#8892a4", cursor: "pointer", padding: 4, display: "flex" }} title="Close">
                <X size={20} />
              </button>
            </div>

            {/* Body (scrolls) */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {children}
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: "1rem 1.25rem", borderTop: "1px solid rgba(59,130,246,0.1)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {footer}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PrimaryButton({ accent, loading, children, ...rest }: { accent: string; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: loading || rest.disabled ? `${accent}66` : accent,
        color: "#04140A", border: "none", borderRadius: 10, padding: "0.6rem 1.3rem",
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.85rem",
        cursor: loading || rest.disabled ? "not-allowed" : "pointer", transition: "background 0.2s",
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{ background: "transparent", color: "#8892a4", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 10, padding: "0.6rem 1.1rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
