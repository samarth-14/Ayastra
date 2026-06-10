import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  connections: number[];
}

export function HeroSection() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const rotationRef = useRef({ x: 0, y: 0 });
  const [count, setCount] = useState({ manufacturers: 0, trades: 0, accuracy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate sphere particles
    const NUM = 180;
    const particles: Particle[] = [];
    for (let i = 0; i < NUM; i++) {
      const phi = Math.acos(-1 + (2 * i) / NUM);
      const theta = Math.sqrt(NUM * Math.PI) * phi;
      const r = 1;
      particles.push({
        x: r * Math.cos(theta) * Math.sin(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(phi),
        vx: 0, vy: 0, vz: 0,
        connections: [],
      });
    }
    // Pre-compute connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dz = particles[i].z - particles[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.45) particles[i].connections.push(j);
      }
    }
    particlesRef.current = particles;

    let t = 0;
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      t += 0.003;
      // Smooth rotation toward mouse
      const targetRY = mouseRef.current.x * 0.6;
      const targetRX = -mouseRef.current.y * 0.3;
      rotationRef.current.y += (targetRY - rotationRef.current.y) * 0.05;
      rotationRef.current.x += (targetRX - rotationRef.current.x) * 0.05;

      const autoY = t;
      const ry = rotationRef.current.y + autoY;
      const rx = rotationRef.current.x;

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.42;

      // Project 3D to 2D with rotation
      const project = (p: Particle) => {
        // Rotate Y
        const cosY = Math.cos(ry), sinY = Math.sin(ry);
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        // Rotate X
        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const fov = 3;
        const ps = fov / (fov + z2);
        return { sx: cx + x1 * scale * ps, sy: cy + y2 * scale * ps, z: z2, ps };
      };

      const projected = particles.map(project);

      // Draw glow center
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.7);
      grad.addColorStop(0, "rgba(59,130,246,0.06)");
      grad.addColorStop(0.5, "rgba(245,158,11,0.03)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (const j of particles[i].connections) {
          const a = projected[i];
          const b = projected[j];
          const visibility = (a.z + b.z) / 2;
          const alpha = Math.max(0, (visibility + 1) / 2) * 0.35;
          const dist = Math.sqrt((a.sx - b.sx) ** 2 + (a.sy - b.sy) ** 2);
          if (dist > scale * 0.5) continue;
          const lineGrad = ctx.createLinearGradient(a.sx, a.sy, b.sx, b.sy);
          lineGrad.addColorStop(0, `rgba(59,130,246,${alpha * 0.8})`);
          lineGrad.addColorStop(0.5, `rgba(245,158,11,${alpha * 0.5})`);
          lineGrad.addColorStop(1, `rgba(59,130,246,${alpha * 0.8})`);
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = projected[i];
        const visibility = (p.z + 1) / 2;
        const r = Math.max(1, 2.5 * p.ps * visibility);
        const alpha = visibility * 0.9;

        // Glow
        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 3);
        const isGold = i % 5 === 0;
        if (isGold) {
          glow.addColorStop(0, `rgba(245,158,11,${alpha * 0.8})`);
          glow.addColorStop(1, "transparent");
        } else {
          glow.addColorStop(0, `rgba(59,130,246,${alpha * 0.6})`);
          glow.addColorStop(1, "transparent");
        }
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = isGold ? `rgba(245,158,11,${alpha})` : `rgba(147,197,253,${alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Count-up animation
  useEffect(() => {
    const targets = { manufacturers: 2400, trades: 180, accuracy: 94 };
    const duration = 2200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        manufacturers: Math.round(ease * targets.manufacturers),
        trades: Math.round(ease * targets.trades),
        accuracy: Math.round(ease * targets.accuracy),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => requestAnimationFrame(tick), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#050816" }}>
      {/* Background mesh */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(59,130,246,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(245,158,11,0.04) 0%, transparent 70%)",
        }} />
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — text */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium w-fit"
            style={{
              borderColor: "rgba(245,158,11,0.4)",
              background: "rgba(245,158,11,0.06)",
              color: "#F59E0B",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
            AI Platform · Live · v2.4.1
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Forging the Future of{" "}
            <span style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #D97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Metal Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              color: "#8892a4",
              fontSize: "1.1rem",
              lineHeight: 1.7,
              fontFamily: "'Inter', sans-serif",
              maxWidth: "520px",
            }}
          >
            AI-powered forecasting, inventory intelligence, price prediction, and scrap optimization for modern metal businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="px-7 py-3.5 rounded-xl font-semibold text-base"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#050816",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.01em",
              }}
            >
              Launch Platform
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 rounded-xl font-semibold text-base flex items-center gap-2 border"
              style={{
                borderColor: "rgba(59,130,246,0.4)",
                background: "rgba(59,130,246,0.06)",
                color: "#93C5FD",
                fontFamily: "'Space Grotesk', sans-serif",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
                <polygon points="6.5,5 11.5,8 6.5,11" fill="currentColor"/>
              </svg>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-8 mt-4 pt-6 border-t"
            style={{ borderColor: "rgba(59,130,246,0.15)" }}
          >
            {[
              { value: `${count.manufacturers.toLocaleString()}+`, label: "Manufacturers" },
              { value: `₹${count.trades}Cr+`, label: "Trades Processed" },
              { value: `${count.accuracy}%`, label: "Forecast Accuracy" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.5rem", fontWeight: 700, color: "#F59E0B" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#8892a4", fontSize: "0.78rem", fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — 3D Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="relative flex items-center justify-center"
          style={{ minHeight: "480px" }}
        >
          {/* Glow rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border animate-pulse"
              style={{ width: "420px", height: "420px", borderColor: "rgba(245,158,11,0.08)", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[460, 520, 580].map((size, i) => (
              <div key={i} className="absolute rounded-full border"
                style={{
                  width: `${size}px`, height: `${size}px`,
                  borderColor: `rgba(59,130,246,${0.06 - i * 0.015})`,
                  animation: `spin ${18 + i * 8}s linear infinite`,
                  borderStyle: "dashed",
                }} />
            ))}
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: "480px", height: "480px", maxWidth: "100%" }}
          />
          {/* Floating data badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 right-4 px-3 py-2 rounded-xl border backdrop-blur-xl text-xs"
            style={{
              background: "rgba(11,17,32,0.85)",
              borderColor: "rgba(245,158,11,0.3)",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#F59E0B",
            }}
          >
            <div style={{ color: "#8892a4", fontSize: "0.65rem", marginBottom: "2px" }}>COPPER/MT</div>
            <div style={{ fontWeight: 700 }}>₹8,42,300</div>
            <div style={{ color: "#22C55E", fontSize: "0.65rem" }}>▲ 3.2%</div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-12 left-4 px-3 py-2 rounded-xl border backdrop-blur-xl text-xs"
            style={{
              background: "rgba(11,17,32,0.85)",
              borderColor: "rgba(59,130,246,0.3)",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#93C5FD",
            }}
          >
            <div style={{ color: "#8892a4", fontSize: "0.65rem", marginBottom: "2px" }}>AI FORECAST</div>
            <div style={{ fontWeight: 700 }}>BULLISH</div>
            <div style={{ color: "#22C55E", fontSize: "0.65rem" }}>94% confidence</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(transparent, #050816)" }} />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
