import { useState } from "react";
import { useNavigate } from "react-router";
import { signUpWithEmail, describeFirebaseAuthError, deleteCurrentFirebaseUser } from "../../firebase";
import api from "../../api/api";

// Keep the client's minimum in lock-step with the backend (main.py signup
// requires >= 8). Firebase alone only requires 6 — the gap silently creates
// orphaned Firebase users for 6–7 char passwords.
const MIN_PASSWORD_LEN = 8;

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // guard against double-submit (no StrictMode, but be safe)
    console.debug("[signup] STEP 1 — entering handleSignup");

    // Validate BEFORE touching Firebase so a too-short password can't create an
    // orphaned Firebase account that the backend then rejects.
    const cleanEmail = email.trim();
    if (password.length < MIN_PASSWORD_LEN) {
      alert(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }

    setLoading(true);

    // ── Phase 1: Firebase ────────────────────────────────────────────────
    let firebaseCreated = false;
    try {
      console.debug("[signup] STEP 2 — calling Firebase createUser", { email: cleanEmail, passwordLength: password.length });
      await signUpWithEmail(cleanEmail, password); // helper trims + logs
      firebaseCreated = true;
      console.debug("[signup] STEP 3 — Firebase success");
    } catch (error) {
      // Firebase failure: nothing was written to the backend, no rollback needed.
      const fb = describeFirebaseAuthError(error, "signup:firebase");
      alert(fb?.userMessage ?? "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    // ── Phase 2: backend (must be atomic with Phase 1) ───────────────────
    try {
      console.debug("[signup] STEP 4 — calling backend POST /auth/signup");
      const response = await api.post("/auth/signup", {
        full_name: fullName,
        email: cleanEmail,
        password: password,
        company_name: companyName,
      });
      console.debug("[signup] STEP 5 — backend success", { status: response.status, data: response.data });

      const data = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("company_id", String(data.company_id));
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("name", data.full_name);

      // Fresh signup → drive the user through mandatory onboarding first.
      // "false" is what the dashboard guard checks to block access.
      localStorage.setItem(
        "onboarding_completed",
        data.is_onboarding_completed ? "true" : "false",
      );
      if (data.marketplace_role) {
        localStorage.setItem("marketplace_role", data.marketplace_role);
      }

      console.debug("[signup] STEP 6 — navigating");
      navigate(data.is_onboarding_completed ? "/dashboard" : "/onboarding");
    } catch (error: any) {
      // Backend errors are axios-shaped: error.response.data / error.response.status.
      // (Do NOT read error.code here — that's the Firebase shape.)
      console.error("[signup] backend failed — full error object:", error);
      console.error("[signup] response.status:", error?.response?.status);
      console.error("[signup] response.data:", error?.response?.data);

      // CRITICAL: Firebase already created the account. Roll it back so the next
      // attempt doesn't hit auth/email-already-in-use for a user that never
      // finished signing up.
      if (firebaseCreated) {
        await deleteCurrentFirebaseUser();
      }

      const status = error?.response?.status;
      const backendDetail = error?.response?.data?.detail;
      if (status === 429) {
        alert(backendDetail || "Too many signup attempts. Please wait and try again.");
      } else if (error?.response) {
        alert(backendDetail || "Signup failed on our server. Please try again.");
      } else {
        // No response object → network/CORS failure (net::ERR_FAILED). The
        // request never reached (or never returned from) the backend.
        alert("Could not reach the server. Check your connection and that the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#141C2E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F59E0B", marginBottom: "0.5rem" }}>
            AYASTRA
          </h1>
          <p style={{ color: "#8892a4", fontSize: "0.9rem" }}>Create your business account</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { label: "Full Name", value: fullName, setter: setFullName, type: "text", placeholder: "Rajesh Sharma" },
            { label: "Company Name", value: companyName, setter: setCompanyName, type: "text", placeholder: "Sharma Metals Pvt. Ltd." },
            { label: "Email", value: email, setter: setEmail, type: "email", placeholder: "you@company.com" },
            { label: "Password", value: password, setter: setPassword, type: "password", placeholder: "••••••••" },
          ].map((field) => (
            <div key={field.label}>
              <label style={{ color: "#8892a4", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: "6px" }}>
                {field.label.toUpperCase()}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                required
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "12px", padding: "0.75rem 1rem", color: "#e8eaf0", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.875rem", borderRadius: "12px", background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: "#141C2E", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem" }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#8892a4", fontSize: "0.8rem" }}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{ color: "#F59E0B", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}