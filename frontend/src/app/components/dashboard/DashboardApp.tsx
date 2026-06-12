import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, BarChart3, Settings, LogOut, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { AstraAvatar } from "../AstraAvatar";
import { AstraChatPanel } from "../AstraChatPanel";

const NAV_ITEMS = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  { label: "Inventory", icon: <Package size={18} />, path: "/dashboard/inventory" },
  { label: "Orders", icon: <ShoppingCart size={18} />, path: "/dashboard/orders" },
  { label: "Markets", icon: <TrendingUp size={18} />, path: "/dashboard/markets" },
  { label: "Analytics", icon: <BarChart3 size={18} />, path: "/dashboard/analytics" },
  { label: "Settings", icon: <Settings size={18} />, path: "/dashboard/settings" },
];

export function DashboardApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#141C2E" }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{ flexShrink: 0, background: "rgba(7,11,24,0.98)", borderRight: "1px solid rgba(59,130,246,0.12)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
      >
        {/* Logo */}
        <div style={{ padding: collapsed ? "1.25rem 0" : "1.25rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", borderBottom: "1px solid rgba(59,130,246,0.08)", justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="white" strokeWidth="1.5" fill="none" />
              <polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="white" opacity="0.8" />
            </svg>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden" }}>
                AYASTRA
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 2 }}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: collapsed ? "0.65rem 0" : "0.65rem 0.75rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? "rgba(245,158,11,0.12)" : "transparent",
                  color: active ? "#F59E0B" : "#8892a4",
                  transition: "background 0.15s, color 0.15s",
                  width: "100%",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(59,130,246,0.07)"; e.currentTarget.style.color = "#e8eaf0"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8892a4"; } }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                      style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: active ? 700 : 500, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden" }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && <motion.div layoutId="activeIndicator" style={{ marginLeft: "auto", width: 3, height: 20, borderRadius: 2, background: "#F59E0B", flexShrink: 0 }} />}
              </motion.button>
            );
          })}

          {/* ASTRA AI button */}
          <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(59,130,246,0.08)", paddingTop: "0.5rem" }}>
            <motion.button
              onClick={() => setChatOpen((o) => !o)}
              whileHover={{ x: 2 }}
              title={collapsed ? "ASTRA AI" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: collapsed ? "0.65rem 0" : "0.65rem 0.75rem",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10, border: chatOpen ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent", cursor: "pointer",
                background: chatOpen ? "rgba(59,130,246,0.1)" : "transparent",
                color: chatOpen ? "#93C5FD" : "#8892a4",
                width: "100%",
                transition: "all 0.15s",
                overflow: "hidden",
              }}
            >
              <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AstraAvatar size={20} />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                    style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden" }}>
                    ASTRA AI
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        {/* Bottom: logout */}
        <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid rgba(59,130,246,0.08)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ x: 2 }}
            title={collapsed ? "Logout" : undefined}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: collapsed ? "0.65rem 0" : "0.65rem 0.75rem", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "#8892a4", width: "100%", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#8892a4"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={18} />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "0.82rem" }}>Logout</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{ position: "absolute", top: "50%", right: -12, transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", background: "#111827", border: "1px solid rgba(59,130,246,0.2)", color: "#8892a4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ flexShrink: 0, background: "rgba(5,8,22,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(59,130,246,0.1)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
              {NAV_ITEMS.find((n) => isActive(n.path))?.label ?? "Dashboard"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "4px 12px", color: "#93C5FD", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}
            >
              <Home size={13} />
              <span style={{ fontSize: "0.75rem" }}>Home</span>
            </motion.button>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#141C2E", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "0.8rem" }}>A</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <Outlet />
        </div>
      </main>

      <AstraChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
