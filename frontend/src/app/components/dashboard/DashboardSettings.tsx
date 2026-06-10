import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Bell, Shield, Webhook, Building, CheckCircle } from "lucide-react";
import { getUserProfile, updateUserProfile, getUserNotifications, updateUserNotifications, getCompanySettings, updateCompanySettings, getIntegrations, updateIntegration } from "../../../api";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
  { id: "integrations", label: "Integrations", icon: <Webhook size={16} /> },
  { id: "company", label: "Company", icon: <Building size={16} /> },
];

const INTEGRATIONS_MOCK = [
  { id: "1", name: "WhatsApp Business", status: "connected", color: "#25D366", detail: "+91 98765 43210" },
  { id: "2", name: "Tally Prime", status: "connected", color: "#3B82F6", detail: "v6.6.3 · Sync every 15m" },
  { id: "3", name: "MCX Data Feed", status: "connected", color: "#F59E0B", detail: "Live · Latency 800ms" },
  { id: "4", name: "Google Sheets", status: "disconnected", color: "#8892a4", detail: "Not configured" },
  { id: "5", name: "Zoho CRM", status: "disconnected", color: "#8892a4", detail: "Not configured" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#F59E0B" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
      <motion.div animate={{ x: on ? 22 : 2 }} transition={{ duration: 0.2 }}
        style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3 }} />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid rgba(59,130,246,0.06)" }}>
      <div>
        <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{label}</div>
        {desc && <div style={{ color: "#4B5563", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export function DashboardSettings() {
  const [active, setActive] = useState("profile");
  const [notifs, setNotifs] = useState({ lowStock: true, orderNew: true, priceAlert: true, weeklyReport: false });
  const [saved, setSaved] = useState(false);
  
  // API state
  const [userProfile, setUserProfile] = useState({ fullName: "Rajesh Sharma", email: "rajesh@example.com", phone: "+91 98765 43210", role: "Admin" });
  const [companySettings, setCompanySettings] = useState({ companyName: "Sharma Metals Pvt. Ltd.", gstin: "27AABCS1429B1Z1", address: "Dharavi, Mumbai 400017", industry: "Metal Trading & Distribution" });
  const [integrations, setIntegrations] = useState(INTEGRATIONS_MOCK);
  const [loading, setLoading] = useState(true);

  // Sample IDs (in production, these would come from auth context)
  const userId = "user-1";
  const companyId = "company-1";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [profile, notifications, company, integrationsData] = await Promise.all([
          getUserProfile(userId).catch(() => null),
          getUserNotifications(userId).catch(() => null),
          getCompanySettings(companyId).catch(() => null),
          getIntegrations(companyId).catch(() => null),
        ]);

        if (profile) {
          setUserProfile(profile);
        }
        if (notifications) {
          setNotifs(notifications);
        }
        if (company) {
          setCompanySettings(company);
        }
        if (integrationsData && Array.isArray(integrationsData)) {
          setIntegrations(integrationsData);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await Promise.all([
        updateUserProfile(userId, userProfile),
        updateUserNotifications(userId, notifs),
        updateCompanySettings(companyId, companySettings),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  return (
    <div style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", maxWidth: 960 }}>
      {/* Sidebar nav */}
      <div style={{ width: 180, flexShrink: 0 }}>
        <div style={{ color: "#8892a4", fontSize: "0.7rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.75rem" }}>SETTINGS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.75rem", borderRadius: 9, border: "none", cursor: "pointer", background: active === s.id ? "rgba(245,158,11,0.12)" : "transparent", color: active === s.id ? "#F59E0B" : "#8892a4", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.82rem", width: "100%", textAlign: "left", transition: "all 0.15s" }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, background: "rgba(11,17,32,0.8)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 16, padding: "1.5rem" }}>
        {active === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: "1.5rem" }}>Profile Settings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              {[
                { key: "fullName", label: "Full Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "role", label: "Role" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>{f.label}</label>
                  <input value={userProfile[f.key as keyof typeof userProfile]} onChange={(e) => setUserProfile((p) => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "0.55rem 0.75rem", color: "#e8eaf0", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.15)")} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {active === "notifications" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: "1.5rem" }}>Notification Preferences</h3>
            <SettingRow label="Low Stock Alerts" desc="Notify when SKU falls below reorder point">
              <Toggle on={notifs.lowStock} onToggle={() => setNotifs((n) => ({ ...n, lowStock: !n.lowStock }))} />
            </SettingRow>
            <SettingRow label="New Order Received" desc="WhatsApp & manual order notifications">
              <Toggle on={notifs.orderNew} onToggle={() => setNotifs((n) => ({ ...n, orderNew: !n.orderNew }))} />
            </SettingRow>
            <SettingRow label="Price Alerts" desc="When metal prices cross your set thresholds">
              <Toggle on={notifs.priceAlert} onToggle={() => setNotifs((n) => ({ ...n, priceAlert: !n.priceAlert }))} />
            </SettingRow>
            <SettingRow label="Weekly Business Report" desc="Sunday 8AM digest of key metrics">
              <Toggle on={notifs.weeklyReport} onToggle={() => setNotifs((n) => ({ ...n, weeklyReport: !n.weeklyReport }))} />
            </SettingRow>
          </motion.div>
        )}

        {active === "security" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: "1.5rem" }}>Security</h3>
            <SettingRow label="Two-Factor Authentication" desc="Enabled via Google Authenticator">
              <span style={{ color: "#22C55E", fontSize: "0.75rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>● Active</span>
            </SettingRow>
            <SettingRow label="Session Timeout" desc="Auto-logout after inactivity">
              <select style={{ background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "0.4rem 0.7rem", color: "#e8eaf0", fontFamily: "'Inter',sans-serif", fontSize: "0.82rem", outline: "none", cursor: "pointer" }}>
                <option>30 minutes</option><option>1 hour</option><option>4 hours</option>
              </select>
            </SettingRow>
            <SettingRow label="Login History" desc="Last login: Jun 10, 2026 at 09:14 AM from Mumbai">
              <button style={{ color: "#3B82F6", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.78rem" }}>View All</button>
            </SettingRow>
          </motion.div>
        )}

        {active === "integrations" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: "1.5rem" }}>Integrations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {integrations.map((integ) => (
                <div key={integ.id || integ.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(5,8,22,0.5)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: "0.9rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: integ.status === "connected" ? "#22C55E" : "#4B5563" }} />
                    <div>
                      <div style={{ color: "#e8eaf0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>{integ.name}</div>
                      <div style={{ color: "#4B5563", fontSize: "0.72rem", fontFamily: "'Inter',sans-serif" }}>{integ.detail}</div>
                    </div>
                  </div>
                  <button onClick={() => {
                    const newStatus = integ.status === "connected" ? "disconnected" : "connected";
                    setIntegrations((prev) => prev.map((i) => (i.id === integ.id || i.name === integ.name) ? { ...i, status: newStatus } : i));
                  }} style={{ background: integ.status === "connected" ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)", border: `1px solid ${integ.status === "connected" ? "rgba(239,68,68,0.25)" : "rgba(59,130,246,0.25)"}`, borderRadius: 8, padding: "4px 12px", color: integ.status === "connected" ? "#EF4444" : "#3B82F6", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.75rem" }}>
                    {integ.status === "connected" ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {active === "company" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: "1.5rem" }}>Company Settings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              {[
                { key: "companyName", label: "Company Name" },
                { key: "gstin", label: "GSTIN" },
                { key: "address", label: "Address" },
                { key: "industry", label: "Industry" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>{f.label}</label>
                  <input value={companySettings[f.key as keyof typeof companySettings]} onChange={(e) => setCompanySettings((p) => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", background: "rgba(5,8,22,0.6)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: "0.55rem 0.75rem", color: "#e8eaf0", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.15)")} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(59,130,246,0.08)" }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
            style={{ display: "flex", alignItems: "center", gap: 6, background: saved ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: saved ? "#22C55E" : "#050816", border: saved ? "1px solid rgba(34,197,94,0.35)" : "none", borderRadius: 10, padding: "0.6rem 1.5rem", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, cursor: "pointer", transition: "all 0.25s" }}>
            {saved ? <><CheckCircle size={14} /> Saved!</> : "Save Changes"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
