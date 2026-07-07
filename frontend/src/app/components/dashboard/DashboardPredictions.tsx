import { useEffect, useState } from "react";

interface Prediction {
  metal: string;
  prediction: string;
  confidence: number;
  current_price: number;
  predicted_price: number;
  recommendation: string;
  error?: string;
}

const METAL_COLORS: Record<string, { border: string; badge: string; icon: string }> = {
  Copper: { border: "1px solid #f97316", badge: "#f9731620", icon: "🟠" },
  Gold:   { border: "1px solid #eab308", badge: "#eab30820", icon: "🟡" },
  Silver: { border: "1px solid #94a3b8", badge: "#94a3b820", icon: "⚪" },
};

const REC_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  BUY:  { bg: "#16a34a20", color: "#4ade80", border: "1px solid #16a34a50" },
  HOLD: { bg: "#eab30820", color: "#fbbf24", border: "1px solid #eab30850" },
  WAIT: { bg: "#dc262620", color: "#f87171", border: "1px solid #dc262650" },
};

export function DashboardPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predRes, accRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || "https://ayastra-backend.onrender.com"}/predictions/all`),
          fetch(`${import.meta.env.VITE_API_URL || "https://ayastra-backend.onrender.com"}/predictions/accuracy`),
        ]);
        setPredictions(await predRes.json());
        setAccuracy(await accRes.json());
      } catch {
        setError("Failed to load predictions. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "1.5rem", background: "#050816", minHeight: "100%", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Metal Price Predictions</h1>
        <p style={{ color: "#8892a4", fontSize: "0.85rem", marginTop: 4 }}>AI-powered next-day price movement forecasts</p>
      </div>

      {loading && <p style={{ color: "#8892a4", textAlign: "center", paddingTop: 60 }}>Loading predictions...</p>}

      {error && (
        <div style={{ background: "#dc262620", border: "1px solid #dc262650", borderRadius: 12, padding: "1rem", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Prediction Cards */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {predictions.map((p) => {
            const colors = METAL_COLORS[p.metal] || METAL_COLORS["Silver"];
            const rec = REC_COLORS[p.recommendation] || REC_COLORS["HOLD"];
            return (
              <div key={p.metal} style={{ background: "#0d1117", borderRadius: 16, border: colors.border, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Title row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.4rem" }}>{colors.icon}</span>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>{p.metal}</span>
                  </div>
                  <span style={{ background: colors.badge, color: p.prediction === "UP" ? "#fb923c" : "#94a3b8", fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                    {p.prediction} {p.prediction === "UP" ? "↑" : "↓"}
                  </span>
                </div>

                {/* Prices */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#161b22", borderRadius: 10, padding: "0.75rem" }}>
                    <p style={{ color: "#8892a4", fontSize: "0.7rem", margin: "0 0 4px" }}>Current Price</p>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", margin: 0 }}>${(p.current_price ?? 0).toLocaleString()}</p>
                  </div>
                  <div style={{ background: "#161b22", borderRadius: 10, padding: "0.75rem" }}>
                    <p style={{ color: "#8892a4", fontSize: "0.7rem", margin: "0 0 4px" }}>Predicted Price</p>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", margin: 0 }}>${(p.predicted_price ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#8892a4", marginBottom: 6 }}>
                    <span>Confidence</span>
                    <span>{p.confidence}%</span>
                  </div>
                  <div style={{ background: "#161b22", borderRadius: 999, height: 6 }}>
                    <div style={{ width: `${p.confidence}%`, height: 6, borderRadius: 999, background: "#F59E0B", transition: "width 0.5s" }} />
                  </div>
                </div>

                {/* Recommendation */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span style={{ background: rec.bg, color: rec.color, border: rec.border, fontSize: "0.82rem", fontWeight: 700, padding: "6px 24px", borderRadius: 999 }}>
                    {p.recommendation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accuracy Section */}
      {accuracy && (
        <div style={{ background: "#0d1117", borderRadius: 16, border: "1px solid rgba(59,130,246,0.15)", padding: "1.25rem" }}>
          <h2 style={{ color: "#fff", fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem" }}>Model Accuracy</h2>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "inline-block", background: "#F59E0B15", border: "1px solid #F59E0B40", borderRadius: 12, padding: "0.6rem 1.25rem" }}>
              <p style={{ color: "#8892a4", fontSize: "0.7rem", margin: "0 0 2px" }}>Overall Accuracy</p>
              <p style={{ color: "#F59E0B", fontWeight: 700, fontSize: "1.4rem", margin: 0 }}>
                {(accuracy.overall_accuracy * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {accuracy.by_metal.map((m: any) => (
              <div key={m.metal} style={{ background: "#161b22", borderRadius: 12, padding: "0.9rem" }}>
                <p style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "0.85rem", margin: "0 0 0.6rem", textTransform: "capitalize" }}>{m.metal}</p>
                {m.error ? (
                  <p style={{ color: "#f87171", fontSize: "0.75rem" }}>{m.error}</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[["Accuracy", `${(m.accuracy * 100).toFixed(1)}%`], ["F1 Score", m.f1], ["Precision", `${(m.precision * 100).toFixed(1)}%`], ["Recall", `${(m.recall * 100).toFixed(1)}%`]].map(([label, val]) => (
                      <div key={label}>
                        <p style={{ color: "#8892a4", fontSize: "0.68rem", margin: "0 0 2px" }}>{label}</p>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.82rem", margin: 0 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}