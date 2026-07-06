import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/* ── Interactive 3D Globe ── */
interface GlobeParticle { x:number; y:number; z:number; connections:number[]; }

function GlobeCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x:0, y:0 });
  const animRef    = useRef(0);
  const rotRef     = useRef({ x:0, y:0 });

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const NUM = 180;
    const particles: GlobeParticle[] = [];
    for (let i = 0; i < NUM; i++) {
      const phi   = Math.acos(-1 + (2 * i) / NUM);
      const theta = Math.sqrt(NUM * Math.PI) * phi;
      particles.push({ x: Math.cos(theta)*Math.sin(phi), y: Math.sin(theta)*Math.sin(phi), z: Math.cos(phi), connections:[] });
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, dz=particles[i].z-particles[j].z;
        if (Math.sqrt(dx*dx+dy*dy+dz*dz) < 0.45) particles[i].connections.push(j);
      }
    }

    let t = 0;
    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      t += 0.003;
      rotRef.current.y += (mouseRef.current.x * 0.6 - rotRef.current.y) * 0.05;
      rotRef.current.x += (-mouseRef.current.y * 0.3 - rotRef.current.x) * 0.05;
      const ry = rotRef.current.y + t, rx = rotRef.current.x;
      const cx = w/2, cy = h/2, scale = Math.min(w,h) * 0.42;

      const project = (p: GlobeParticle) => {
        const cosY=Math.cos(ry), sinY=Math.sin(ry);
        const x1=p.x*cosY-p.z*sinY, z1=p.x*sinY+p.z*cosY;
        const cosX=Math.cos(rx), sinX=Math.sin(rx);
        const y2=p.y*cosX-z1*sinX, z2=p.y*sinX+z1*cosX;
        const ps=3/(3+z2);
        return { sx:cx+x1*scale*ps, sy:cy+y2*scale*ps, z:z2, ps };
      };

      const proj = particles.map(project);

      const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,scale*0.7);
      grd.addColorStop(0,"rgba(59,130,246,0.06)"); grd.addColorStop(0.5,"rgba(245,158,11,0.03)"); grd.addColorStop(1,"transparent");
      ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);

      for (let i=0; i<particles.length; i++) {
        for (const j of particles[i].connections) {
          const a=proj[i], b=proj[j];
          const vis=(a.z+b.z)/2, alpha=Math.max(0,(vis+1)/2)*0.35;
          const dist=Math.sqrt((a.sx-b.sx)**2+(a.sy-b.sy)**2);
          if (dist>scale*0.5) continue;
          const lg=ctx.createLinearGradient(a.sx,a.sy,b.sx,b.sy);
          lg.addColorStop(0,`rgba(59,130,246,${alpha*0.8})`);
          lg.addColorStop(0.5,`rgba(245,158,11,${alpha*0.5})`);
          lg.addColorStop(1,`rgba(59,130,246,${alpha*0.8})`);
          ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy);
          ctx.strokeStyle=lg; ctx.lineWidth=0.6; ctx.stroke();
        }
      }

      for (let i=0; i<particles.length; i++) {
        const p=proj[i], vis=(p.z+1)/2, r=Math.max(1,2.5*p.ps*vis), alpha=vis*0.9;
        const isGold=i%5===0;
        const glow=ctx.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,r*3);
        glow.addColorStop(0,isGold?`rgba(245,158,11,${alpha*0.8})`:`rgba(59,130,246,${alpha*0.6})`);
        glow.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(p.sx,p.sy,r*3,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
        ctx.beginPath(); ctx.arc(p.sx,p.sy,r,0,Math.PI*2);
        ctx.fillStyle=isGold?`rgba(245,158,11,${alpha})`:`rgba(147,197,253,${alpha})`; ctx.fill();
      }
      animRef.current=requestAnimationFrame(draw);
    };
    draw();

    const onMouse=(e:MouseEvent)=>{
      mouseRef.current={ x:(e.clientX/window.innerWidth-0.5)*2, y:(e.clientY/window.innerHeight-0.5)*2 };
    };
    window.addEventListener("mousemove", onMouse);
    return ()=>{ cancelAnimationFrame(animRef.current); window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMouse); };
  },[]);

  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%" }} />;
}

/* ── Feature cards ── */
const FEATURES = [
  {
    icon:"📦", title:"Smart Inventory",
    desc:"Real-time stock visibility across all warehouses. Low-stock alerts, intelligent reorder points, and predictive stocking powered by AI.",
    href:"/features/smart-inventory", accent:"#F59E0B",
    bullets:["Real-time stock monitoring","AI-powered reorder alerts","Inventory valuation engine"],
  },
  {
    icon:"💬", title:"WhatsApp Automation",
    desc:"Convert WhatsApp messages into structured orders automatically using NLP. Zero manual data entry.",
    href:"/features/whatsapp-automation", accent:"#22C55E",
    bullets:["NLP order extraction","Auto inventory check","Instant confirmation"],
  },
  {
    icon:"📈", title:"Metal Price Intelligence",
    desc:"Bloomberg-grade price monitoring, AI forecasting, and market heatmaps for every major metal commodity.",
    href:"/features/metal-price", accent:"#3B82F6",
    bullets:["Live LME price feeds","30–90 day AI forecasts","Market heatmap & alerts"],
  },
  {
    icon:"📊", title:"Business Analytics",
    desc:"Executive dashboards, revenue analytics, demand forecasting, and business health scoring in one platform.",
    href:"/features/business-analytics", accent:"#8B5CF6",
    bullets:["Revenue & profit tracking","Demand forecasting","Business health score"],
  },
  {
    icon:"♻️", title:"Scrap Optimizer",
    desc:"AI-powered buyer discovery and scrap price optimization.",
    href:"/features/scrap-optimizer", accent:"#22C55E",
    bullets:["AI Price Prediction","Buyer Comparison","Market Trends"],
  },
];

/* ── Glance preview (static visual) ── */
const STATS = [
  {label:"Today's Revenue", value:"₹42.7L", delta:"+18.2%", up:true},
  {label:"Active Orders",   value:"284",    delta:"+7 new",  up:true},
  {label:"Inventory Value", value:"₹8.4Cr", delta:"-2.1%",  up:false},
  {label:"AI Alerts",       value:"3",      delta:"Action needed", up:false},
];

function GlanceSection() {
  const [counts, setCounts] = useState([0,0,0,0]);
  useEffect(()=>{
    const t=setTimeout(()=>{
      const targets=[427,284,840,3]; const dur=1800; const start=Date.now();
      const tick=()=>{
        const p=Math.min((Date.now()-start)/dur,1);
        const e=1-Math.pow(1-p,3);
        setCounts(targets.map(v=>Math.round(e*v)));
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },300);
    return ()=>clearTimeout(t);
  },[]);

  return (
    <section className="relative py-28 overflow-hidden" style={{background:"#0B1120"}}>
      <div className="absolute inset-0 pointer-events-none"
        style={{background:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(245,158,11,0.04) 0%,transparent 60%)"}}/>
      <div className="max-w-6xl mx-auto px-8">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.7}} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-5"
            style={{borderColor:"rgba(245,158,11,0.3)",background:"rgba(245,158,11,0.06)",color:"#F59E0B",fontFamily:"'JetBrains Mono',monospace"}}>
            PLATFORM PREVIEW
          </div>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"clamp(1.9rem,3.5vw,2.8rem)",letterSpacing:"-0.03em",color:"#fff",lineHeight:1.1}}>
            Your Business at a Glance
          </h2>
          <p style={{color:"#8892a4",marginTop:"1rem",fontSize:"1rem",fontFamily:"'Inter',sans-serif"}}>
            Everything you need, unified in one intelligent platform.
          </p>
        </motion.div>

        {/* Mock dashboard chrome */}
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.8}} className="rounded-2xl border overflow-hidden"
          style={{background:"rgba(5,8,22,0.9)",borderColor:"rgba(59,130,246,0.18)",boxShadow:"0 0 60px rgba(59,130,246,0.07),0 30px 60px rgba(0,0,0,0.5)"}}>
          {/* Chrome bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b" style={{borderColor:"rgba(59,130,246,0.1)"}}>
            <div className="flex gap-1.5">
              {["#EF4444","#F59E0B","#22C55E"].map(c=><div key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c,opacity:.8}}/>)}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-lg text-xs" style={{background:"rgba(59,130,246,0.07)",color:"#8892a4",fontFamily:"'JetBrains Mono',monospace"}}>
                app.ayastra.ai/dashboard
              </div>
            </div>
            <div className="flex items-center gap-1.5" style={{color:"#22C55E",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.72rem"}}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"#22C55E"}}/>LIVE
            </div>
          </div>

          <div className="p-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {STATS.map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,scale:.92}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:.4,delay:i*.07}}
                  className="p-4 rounded-xl border" style={{background:"rgba(11,17,32,0.85)",borderColor:"rgba(59,130,246,0.12)"}}>
                  <div style={{color:"#8892a4",fontSize:"0.7rem",fontFamily:"'Inter',sans-serif",marginBottom:"6px"}}>{s.label}</div>
                  <div style={{color:"#fff",fontFamily:"'JetBrains Mono',monospace",fontSize:"1.3rem",fontWeight:700}}>{s.value}</div>
                  <div style={{color:s.up?"#22C55E":"#EF4444",fontSize:"0.7rem",marginTop:"4px",fontFamily:"'JetBrains Mono',monospace"}}>
                    {s.up?"▲":"▼"} {s.delta}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chart placeholder rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue sparkline */}
              <div className="md:col-span-2 p-4 rounded-xl border" style={{background:"rgba(11,17,32,0.85)",borderColor:"rgba(59,130,246,0.12)"}}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{color:"#e8eaf0",fontSize:"0.82rem",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>Revenue Trend</span>
                  <span className="px-2 py-0.5 rounded text-xs" style={{background:"rgba(245,158,11,0.1)",color:"#F59E0B",fontFamily:"'JetBrains Mono',monospace"}}>6M</span>
                </div>
                <svg viewBox="0 0 300 80" className="w-full" style={{height:"80px"}}>
                  <defs>
                    <linearGradient id="glance-spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0 65 L50 55 L100 62 L150 42 L200 28 L250 15 L300 8" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M0 65 L50 55 L100 62 L150 42 L200 28 L250 15 L300 8 L300 80 L0 80 Z" fill="url(#glance-spark)"/>
                  {[[50,55],[100,62],[150,42],[200,28],[250,15],[300,8]].map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r="2.5" fill="#F59E0B"/>
                  ))}
                </svg>
              </div>

              {/* Inventory bars */}
              <div className="p-4 rounded-xl border" style={{background:"rgba(11,17,32,0.85)",borderColor:"rgba(59,130,246,0.12)"}}>
                <div style={{color:"#e8eaf0",fontSize:"0.82rem",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:"12px"}}>Inventory Health</div>
                <div className="flex flex-col gap-2.5">
                  {[{l:"Copper Rods",pct:84,c:"#F59E0B"},{l:"Brass Sheets",pct:40,c:"#EF4444"},{l:"Steel Beams",pct:91,c:"#22C55E"},{l:"Aluminum",pct:30,c:"#EF4444"}].map(b=>(
                    <div key={b.l}>
                      <div className="flex justify-between mb-1">
                        <span style={{color:"#8892a4",fontSize:"0.68rem",fontFamily:"'Inter',sans-serif"}}>{b.l}</span>
                        <span style={{color:b.c,fontSize:"0.68rem",fontFamily:"'JetBrains Mono',monospace"}}>{b.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{background:"rgba(59,130,246,0.08)"}}>
                        <motion.div className="h-full rounded-full" style={{background:b.c}}
                          initial={{width:0}} whileInView={{width:`${b.pct}%`}} viewport={{once:true}} transition={{duration:.7,delay:.2}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main page ── */
export function HomePage() {
  const navigate = useNavigate();
  const [heroCount, setHeroCount] = useState({m:0,t:0,a:0});

  useEffect(()=>{
    const t=setTimeout(()=>{
      const dur=2000; const start=Date.now();
      const tick=()=>{
        const p=Math.min((Date.now()-start)/dur,1),e=1-Math.pow(1-p,3);
        setHeroCount({m:Math.round(e*2400),t:Math.round(e*180),a:Math.round(e*94)});
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },500);
    return ()=>clearTimeout(t);
  },[]);

  return (
    <div className="min-h-screen" style={{background:"#141C2E"}}>
      <Navbar/>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{background:"#141C2E"}}>
        <div className="absolute inset-0 pointer-events-none"
          style={{background:"radial-gradient(ellipse 80% 60% at 60% 40%,rgba(59,130,246,0.06) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 20% 80%,rgba(245,158,11,0.04) 0%,transparent 70%)"}}/>
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{backgroundImage:"linear-gradient(rgba(59,130,246,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.08) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div className="flex flex-col gap-6">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6,delay:.2}}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium w-fit"
              style={{borderColor:"rgba(245,158,11,0.4)",background:"rgba(245,158,11,0.06)",color:"#F59E0B",fontFamily:"'JetBrains Mono',monospace"}}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:"#22C55E"}}/>
              AI Platform · Live · v2.4.1
            </motion.div>

            <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.3}}
              style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"clamp(2.4rem,5vw,4rem)",lineHeight:1.1,letterSpacing:"-0.03em",color:"#fff"}}>
              Forging the Future of{" "}
              <span style={{background:"linear-gradient(135deg,#F59E0B 0%,#FCD34D 50%,#D97706 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                Metal Intelligence
              </span>
            </motion.h1>

            <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.5}}
              style={{color:"#8892a4",fontSize:"1.1rem",lineHeight:1.7,fontFamily:"'Inter',sans-serif",maxWidth:"520px"}}>
              The AI Operating System for metal manufacturers, wholesalers, traders, and recyclers. Inventory intelligence, price forecasting, and order automation — all in one platform.
            </motion.p>


            {/* Stats */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.8}}
              className="flex gap-8 mt-4 pt-6 border-t" style={{borderColor:"rgba(59,130,246,0.15)"}}>
              {[
                {val:`${heroCount.m.toLocaleString()}+`,label:"Manufacturers"},
                {val:`₹${heroCount.t}Cr+`,label:"Trades Processed"},
                {val:`${heroCount.a}%`,label:"Forecast Accuracy"},
              ].map(s=>(
                <div key={s.label}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.5rem",fontWeight:700,color:"#F59E0B"}}>{s.val}</div>
                  <div style={{color:"#8892a4",fontSize:"0.78rem",fontFamily:"'Inter',sans-serif",marginTop:"2px"}}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — interactive 3D globe */}
          <motion.div initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{duration:1.2,delay:.4,ease:"easeOut"}}
            className="relative flex items-center justify-center" style={{minHeight:"480px"}}>
            {/* Glow rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full border animate-pulse"
                style={{width:"420px",height:"420px",borderColor:"rgba(245,158,11,0.08)",background:"radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)"}}/>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[460,520,580].map((size,i)=>(
                <div key={i} className="absolute rounded-full border"
                  style={{width:`${size}px`,height:`${size}px`,borderColor:`rgba(59,130,246,${0.06-i*0.015})`,
                    animation:`spin ${18+i*8}s linear infinite`,borderStyle:"dashed"}}/>
              ))}
            </div>
            <div style={{width:"480px",height:"480px",maxWidth:"100%"}}>
              <GlobeCanvas/>
            </div>
            {/* Floating badges */}
            <motion.div animate={{y:[0,-8,0]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
              className="absolute top-8 right-4 px-3 py-2 rounded-xl border backdrop-blur-xl"
              style={{background:"rgba(11,17,32,0.85)",borderColor:"rgba(245,158,11,0.3)",fontFamily:"'JetBrains Mono',monospace"}}>
              <div style={{color:"#8892a4",fontSize:"0.65rem",marginBottom:"2px"}}>COPPER/MT</div>
              <div style={{color:"#F59E0B",fontWeight:700}}>₹7,84,500</div>
              <div style={{color:"#22C55E",fontSize:"0.65rem"}}>▲ 1.2%</div>
            </motion.div>
            <motion.div animate={{y:[0,8,0]}} transition={{duration:4,repeat:Infinity,ease:"easeInOut",delay:1}}
              className="absolute bottom-12 left-4 px-3 py-2 rounded-xl border backdrop-blur-xl"
              style={{background:"rgba(11,17,32,0.85)",borderColor:"rgba(59,130,246,0.3)",fontFamily:"'JetBrains Mono',monospace"}}>
              <div style={{color:"#8892a4",fontSize:"0.65rem",marginBottom:"2px"}}>AI FORECAST</div>
              <div style={{color:"#93C5FD",fontWeight:700}}>BULLISH</div>
              <div style={{color:"#22C55E",fontSize:"0.65rem"}}>94% confidence</div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{background:"linear-gradient(transparent,#141C2E)"}}/>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </section>

      {/* ── FEATURE OVERVIEW ── */}
      <section className="relative py-28 overflow-hidden" style={{background:"#141C2E"}}>
        <div className="absolute inset-0 pointer-events-none"
          style={{background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(59,130,246,0.04) 0%,transparent 70%)"}}/>
        <div className="max-w-6xl mx-auto px-8">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.7}} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-5"
              style={{borderColor:"rgba(59,130,246,0.3)",background:"rgba(59,130,246,0.06)",color:"#93C5FD",fontFamily:"'JetBrains Mono',monospace"}}>
              FOUR CORE MODULES
            </div>
            <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"clamp(1.9rem,3.5vw,2.8rem)",letterSpacing:"-0.03em",color:"#fff",lineHeight:1.1}}>
              Everything Your Metal Business Needs
            </h2>
            <p style={{color:"#8892a4",marginTop:"1rem",fontSize:"1rem",fontFamily:"'Inter',sans-serif"}}>
              Four powerful modules. One unified platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f,i)=>(
              <motion.div key={f.href}
                initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6,delay:i*.1}}
                onClick={()=>navigate(f.href)}
                className="group relative flex flex-col gap-4 p-7 rounded-2xl border cursor-pointer"
                style={{background:"rgba(11,17,32,0.7)",borderColor:"rgba(59,130,246,0.12)",backdropFilter:"blur(20px)",transition:"all 0.3s ease"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${f.accent}40`;e.currentTarget.style.boxShadow=`0 0 40px ${f.accent}12,0 8px 40px rgba(0,0,0,0.4)`;e.currentTarget.style.transform="translateY(-4px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(59,130,246,0.12)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}
              >
                <div className="absolute top-0 left-8 right-8 h-px rounded-full"
                  style={{background:`linear-gradient(90deg,transparent,${f.accent}50,transparent)`}}/>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{background:`${f.accent}14`,border:`1px solid ${f.accent}25`}}>
                    {f.icon}
                  </div>
                  <motion.div className="w-8 h-8 rounded-full flex items-center justify-center border opacity-0 group-hover:opacity-100"
                    style={{borderColor:`${f.accent}40`,background:`${f.accent}10`,transition:"opacity 0.2s"}}
                    animate={{x:[0,4,0]}} transition={{duration:1.5,repeat:Infinity,ease:"easeInOut"}}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke={f.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
                <div>
                  <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"1.15rem",color:"#fff",letterSpacing:"-0.01em",marginBottom:"6px"}}>{f.title}</h3>
                  <p style={{color:"#8892a4",fontSize:"0.85rem",lineHeight:1.65,fontFamily:"'Inter',sans-serif"}}>{f.desc}</p>
                </div>
                <ul className="flex flex-col gap-1.5 mt-1">
                  {f.bullets.map(b=>(
                    <li key={b} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{background:f.accent}}/>
                      <span style={{color:"#6B7280",fontSize:"0.78rem",fontFamily:"'Inter',sans-serif"}}>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center gap-1.5" style={{color:f.accent,fontSize:"0.78rem",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>
                  Learn more
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GlanceSection/>
      <Footer/>
    </div>
  );
}
