"use client";

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
  Copper:  { border: "border-orange-500", badge: "bg-orange-500/20 text-orange-400", icon: "🟠" },
  Gold:    { border: "border-yellow-500", badge: "bg-yellow-500/20 text-yellow-400", icon: "🟡" },
  Silver:  { border: "border-slate-400",  badge: "bg-slate-400/20 text-slate-300",   icon: "⚪" },
};

const REC_COLORS: Record<string, string> = {
  BUY:  "bg-green-500/20 text-green-400 border border-green-500/30",
  HOLD: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  WAIT: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predRes, accRes] = await Promise.all([
          fetch("http://localhost:8000/predictions/all"),
          fetch("http://localhost:8000/predictions/accuracy"),
        ]);
        const predData = await predRes.json();
        const accData  = await accRes.json();
        setPredictions(predData);
        setAccuracy(accData);
      } catch (e) {
        setError("Failed to load predictions. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Metal Price Predictions</h1>
          <p className="text-slate-400 mt-1">AI-powered next-day price movement forecasts</p>
        </div>

        {loading && (
          <div className="text-slate-400 text-center py-20">Loading predictions...</div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Prediction Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {predictions.map((p) => {
              const colors = METAL_COLORS[p.metal] || METAL_COLORS["Silver"];
              return (
                <div
                  key={p.metal}
                  className={`bg-[#0d1117] rounded-2xl border ${colors.border} p-6 flex flex-col gap-4`}
                >
                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{colors.icon}</span>
                      <span className="text-xl font-semibold">{p.metal}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                      {p.prediction} {p.prediction === "UP" ? "↑" : "↓"}
                    </span>
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#161b22] rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">Current Price</p>
                      <p className="text-lg font-bold">${p.current_price.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#161b22] rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">Predicted Price</p>
                      <p className="text-lg font-bold">${p.predicted_price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Confidence</span>
                      <span>{p.confidence}%</span>
                    </div>
                    <div className="w-full bg-[#161b22] rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-amber-500 transition-all"
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="flex justify-center">
                    <span className={`text-sm font-bold px-6 py-2 rounded-full ${REC_COLORS[p.recommendation] || REC_COLORS["HOLD"]}`}>
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
          <div className="bg-[#0d1117] rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Model Accuracy</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-6 py-3">
                <p className="text-xs text-slate-400">Overall Accuracy</p>
                <p className="text-2xl font-bold text-amber-400">
                  {(accuracy.overall_accuracy * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accuracy.by_metal.map((m: any) => (
                <div key={m.metal} className="bg-[#161b22] rounded-xl p-4">
                  <p className="text-sm font-semibold capitalize mb-3">{m.metal}</p>
                  {m.error ? (
                    <p className="text-red-400 text-xs">{m.error}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400">Accuracy</p>
                        <p className="text-white font-semibold">{(m.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">F1 Score</p>
                        <p className="text-white font-semibold">{m.f1}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Precision</p>
                        <p className="text-white font-semibold">{(m.precision * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Recall</p>
                        <p className="text-white font-semibold">{(m.recall * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}