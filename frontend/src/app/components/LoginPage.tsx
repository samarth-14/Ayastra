import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { signInWithGoogle, signInWithEmail, describeFirebaseAuthError } from "../../firebase";
/* ─── Particle Globe (same engine as HeroSection) ─── */
interface Particle {
  x: number; y: number; z: number;
  connections: number[];
}

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const rotRef    = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const NUM = 200;
    const pts: Particle[] = [];
    for (let i = 0; i < NUM; i++) {
      const phi   = Math.acos(-1 + (2 * i) / NUM);
      const theta = Math.sqrt(NUM * Math.PI) * phi;
      pts.push({
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        connections: [],
      });
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 0.46) pts[i].connections.push(j);
      }
    }

    let t = 0;
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      t += 0.003;

      rotRef.current.y += (mouseRef.current.x * 0.5 - rotRef.current.y) * 0.04;
      rotRef.current.x += (-mouseRef.current.y * 0.25 - rotRef.current.x) * 0.04;

      const ry = rotRef.current.y + t, rx = rotRef.current.x;
      const cx = W / 2, cy = H / 2;
      const sc = Math.min(W, H) * 0.44;

      const project = (p: Particle) => {
        const cosY = Math.cos(ry), sinY = Math.sin(ry);
        const x1 = p.x*cosY - p.z*sinY, z1 = p.x*sinY + p.z*cosY;
        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        const y2 = p.y*cosX - z1*sinX, z2 = p.y*sinX + z1*cosX;
        const fov = 3, ps = fov / (fov + z2);
        return { sx: cx + x1*sc*ps, sy: cy + y2*sc*ps, z: z2, ps };
      };

      const proj = pts.map(project);

      // ambient glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sc * 0.8);
      g.addColorStop(0, "rgba(59,130,246,0.07)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // connections
      for (let i = 0; i < pts.length; i++) {
        for (const j of pts[i].connections) {
          const a = proj[i], b = proj[j];
          const vis = ((a.z + b.z) / 2 + 1) / 2;
          const alpha = vis * 0.3;
          if (Math.hypot(a.sx - b.sx, a.sy - b.sy) > sc * 0.55) continue;
          const lg = ctx.createLinearGradient(a.sx, a.sy, b.sx, b.sy);
          lg.addColorStop(0,   `rgba(59,130,246,${alpha})`);
          lg.addColorStop(0.5, `rgba(245,158,11,${alpha*0.5})`);
          lg.addColorStop(1,   `rgba(59,130,246,${alpha})`);
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = lg; ctx.lineWidth = 0.55; ctx.stroke();
        }
      }

      // nodes
      for (let i = 0; i < pts.length; i++) {
        const p = proj[i];
        const vis = (p.z + 1) / 2;
        const r = Math.max(0.8, 2.4 * p.ps * vis);
        const gold = i % 5 === 0;
        const gc = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 3.5);
        gc.addColorStop(0, gold ? `rgba(245,158,11,${vis*0.75})` : `rgba(59,130,246,${vis*0.55})`);
        gc.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(p.sx, p.sy, r*3.5, 0, Math.PI*2);
        ctx.fillStyle = gc; ctx.fill();
        ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI*2);
        ctx.fillStyle = gold ? `rgba(245,158,11,${vis})` : `rgba(147,197,253,${vis})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

/* ─── Mini ticker ─── */
const TICKERS = [
  { name: "Copper",   change: "+3.2%", up: true  },
  { name: "Brass",    change: "-1.4%", up: false },
  { name: "Steel",    change: "+2.7%", up: true  },
  { name: "Aluminum", change: "+0.9%", up: true  },
  { name: "Nickel",   change: "+4.1%", up: true  },
  { name: "Zinc",     change: "+1.6%", up: true  },
];

function MiniTicker() {
  const doubled = [...TICKERS, ...TICKERS, ...TICKERS];
  return (
    <div className="relative overflow-hidden" style={{ height: "32px" }}>
      <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(5,8,22,0.9), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, rgba(5,8,22,0.9), transparent)" }} />
      <motion.div
        className="flex items-center h-full"
        animate={{ x: [0, -100 * TICKERS.length * 5.5] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content", gap: "0" }}
      >
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-4 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: t.up ? "#22C55E" : "#EF4444" }} />
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.78rem" }}>{t.name}</span>
            <span style={{ color: t.up ? "#22C55E" : "#EF4444", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700 }}>
              {t.up ? "▲" : "▼"} {t.change}
            </span>
            <div className="w-px h-3 ml-2" style={{ background: "rgba(59,130,246,0.2)" }} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Google SVG icon ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

/* ─── Main Login Page ─── */
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<"email"|"password"|null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("name", user.displayName || user.email || "");
      localStorage.setItem("user_id", user.uid);
      localStorage.setItem("company_id", "1");
      // Email/password login authenticates against Firebase only (no backend
      // JWT), so onboarding status can't be checked here. Treat as an existing
      // user and go straight to the dashboard — onboarding is enforced at the
      // signup / Google-login paths where a backend token is available.
      localStorage.setItem("onboarding_completed", "true");
      navigate("/dashboard");
    } catch (error) {
      // Firebase errors carry .code / .message (NOT error.response.data.detail).
      const fb = describeFirebaseAuthError(error, "login");
      alert(fb?.userMessage ?? "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const firebaseToken = await user.getIdToken();
      
      // Register/login user in our backend
      const response = await fetch("https://ayastra-backend.onrender.com/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          full_name: user.displayName || user.email,
          firebase_uid: user.uid,
        }),
      });
      const data = await response.json();
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.full_name);
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("company_id", String(data.company_id));

      // Backend tells us whether onboarding is done. New Google users land on
      // the onboarding flow; returning users go straight to the dashboard.
      const done = !!data.is_onboarding_completed;
      localStorage.setItem("onboarding_completed", done ? "true" : "false");
      if (data.marketplace_role) {
        localStorage.setItem("marketplace_role", data.marketplace_role);
      }
      navigate(done ? "/dashboard" : "/onboarding");
    } catch (error) {
      // Popup/redirect Firebase errors (e.g. auth/popup-closed-by-user,
      // auth/operation-not-allowed) surface via .code here too.
      const fb = describeFirebaseAuthError(error, "google-login");
      console.error("Google login failed:", error);
      alert(fb?.userMessage ?? "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen flex overflow-hidden"
      style={{ background: "#141C2E", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ══════════════════════════════════
          LEFT PANEL — Branding + Globe
      ══════════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col flex-1 overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: "linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(59,130,246,0.07) 0%, rgba(245,158,11,0.03) 40%, transparent 70%)" }} />

        {/* Globe fills the panel */}
        <div className="absolute inset-0">
          <GlobeCanvas />
        </div>

        {/* Dark vignette around edges */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, rgba(5,8,22,0.7) 100%)" }} />
        <div className="absolute inset-y-0 right-0 w-32 pointer-events-none"
          style={{ background: "linear-gradient(-90deg, #141C2E, transparent)" }} />

        {/* Logo top-left */}
        <div className="relative z-10 p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 0 20px rgba(245,158,11,0.35)" }}>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="white" strokeWidth="1.5" fill="none"/>
                <polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="white" opacity="0.85"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.02em" }}>
              AYASTRA
            </span>
          </motion.div>
        </div>

        {/* Center headline */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 -mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center max-w-lg"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.07)", color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
              AI PLATFORM · LIVE
            </div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, marginBottom: "16px" }}>
              Welcome to{" "}
              <span style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #D97706 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AYASTRA
              </span>
            </h1>
            <p style={{ color: "#8892a4", fontSize: "1rem", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>
              The AI Operating System for the Metal Industry.
            </p>
          </motion.div>
        </div>

        {/* Bottom ticker strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative z-10 mx-6 mb-8 rounded-xl border px-4 py-2"
          style={{ background: "rgba(11,17,32,0.8)", borderColor: "rgba(59,130,246,0.15)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-3 mb-1.5">
            <div className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#141C2E", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem" }}>
              LIVE
            </div>
            <span style={{ color: "#8892a4", fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace" }}>METAL MARKETS</span>
          </div>
          <MiniTicker />
        </motion.div>

        {/* Stats row at very bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="relative z-10 flex justify-center gap-10 pb-8"
        >
          {[
            { val: "2,400+", label: "Manufacturers" },
            { val: "94%",    label: "Forecast Accuracy" },
            { val: "₹180Cr+", label: "Trades" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "#F59E0B" }}>{s.val}</div>
              <div style={{ color: "#4B5563", fontSize: "0.68rem", fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════
          RIGHT PANEL — Login Card
      ══════════════════════════════════ */}
      <div className="relative flex flex-col items-center justify-center w-full lg:w-[480px] shrink-0 px-6 py-10 overflow-y-auto"
        style={{ background: "rgba(7,11,24,0.98)", borderLeft: "1px solid rgba(59,130,246,0.12)" }}
      >
        {/* Ambient glow behind card */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%)" }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="white" strokeWidth="1.5" fill="none"/>
              <polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="white" opacity="0.85"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#fff" }}>AYASTRA</span>
        </div>

        {/* ── Glassmorphism Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm"
        >
          {/* Floating animation wrapper */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative rounded-2xl border p-8"
              style={{
                background: "rgba(11,17,32,0.75)",
                borderColor: "rgba(59,130,246,0.2)",
                backdropFilter: "blur(40px)",
                boxShadow: "0 0 60px rgba(59,130,246,0.08), 0 0 100px rgba(245,158,11,0.04), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Gold top accent line */}
              <div className="absolute top-0 left-8 right-8 h-px rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, #F59E0B80, #3B82F660, transparent)" }} />
              {/* Blue bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-20 rounded-b-2xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.06), transparent)" }} />

              {/* Card Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", boxShadow: "0 0 24px rgba(245,158,11,0.3)" }}>
                  <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                    <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="white" strokeWidth="1.5" fill="none"/>
                    <polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="white" opacity="0.85"/>
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-6">
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  Sign In
                </h2>
                <p style={{ color: "#8892a4", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                  Access your business intelligence dashboard
                </p>
              </div>

              {/* Google button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(59,130,246,0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border mb-5 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "#e8eaf0",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                <GoogleIcon />
                Continue with Google
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: "rgba(59,130,246,0.15)" }} />
                <span style={{ color: "#4B5563", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(59,130,246,0.15)" }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                {/* Email */}
                <div className="relative">
                  <label style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: "6px" }}>
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="4" width="20" height="16" rx="3" stroke={focused === "email" ? "#F59E0B" : "#4B5563"} strokeWidth="1.5"/>
                        <path d="M2 8l10 6 10-6" stroke={focused === "email" ? "#F59E0B" : "#4B5563"} strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="you@company.com"
                      required
                      className="w-full rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${focused === "email" ? "rgba(245,158,11,0.5)" : "rgba(59,130,246,0.15)"}`,
                        color: "#e8eaf0",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.875rem",
                        boxShadow: focused === "email" ? "0 0 16px rgba(245,158,11,0.08)" : "none",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label style={{ color: "#8892a4", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.04em" }}>
                      PASSWORD
                    </label>
                    <button type="button"
                      style={{ color: "#F59E0B", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke={focused === "password" ? "#F59E0B" : "#4B5563"} strokeWidth="1.5"/>
                        <path d="M8 11V7a4 4 0 018 0v4" stroke={focused === "password" ? "#F59E0B" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••••••"
                      required
                      className="w-full rounded-xl pl-10 pr-10 py-3 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${focused === "password" ? "rgba(245,158,11,0.5)" : "rgba(59,130,246,0.15)"}`,
                        color: "#e8eaf0",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.875rem",
                        boxShadow: focused === "password" ? "0 0 16px rgba(245,158,11,0.08)" : "none",
                      }}
                    />
                    <button type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity duration-150"
                      style={{ color: "#4B5563", opacity: 0.7, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                      onClick={() => setShowPass((v) => !v)}
                    >
                      {showPass ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#8892a4" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="#8892a4" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#8892a4" strokeWidth="1.5"/>
                          <circle cx="12" cy="12" r="3" stroke="#8892a4" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 36px rgba(245,158,11,0.45)" } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full py-3.5 rounded-xl font-semibold mt-1 flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)",
                    color: "#141C2E",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9rem",
                    letterSpacing: "0.01em",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="spinner"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          className="w-4 h-4 rounded-full border-2"
                          style={{ borderColor: "rgba(5,8,22,0.4)", borderTopColor: "#141C2E" }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </motion.div>
                    ) : (
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Sign In
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              {/* Sign up link */}
              <p className="text-center mt-5" style={{ color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
                Don't have an account?{" "}
                <button
                 style={{ color: "#F59E0B", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                 onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                 onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                 onClick={() => navigate("/signup")}
               >
                 Create Account
               </button>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex gap-5 mt-8"
        >
          {["Privacy Policy", "Terms of Service"].map((t) => (
            <button key={t}
              style={{ color: "#374151", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8892a4")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
            >
              {t}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
