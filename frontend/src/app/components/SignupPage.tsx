import { useState } from "react";
import { useNavigate } from "react-router";
import { signUpWithEmail } from "../../firebase";
import api from "../../api/api";

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user in Firebase
      await signUpWithEmail(email, password);

      // Create user + company in our backend
      const response = await api.post("/auth/signup", {
        full_name: fullName,
        email: email,
        password: password,
        company_name: companyName,
      });

      const data = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("company_id", String(data.company_id));
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("name", data.full_name);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup failed:", error);
      alert(error?.response?.data?.detail || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050816", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
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
            style={{ width: "100%", padding: "0.875rem", borderRadius: "12px", background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: "#050816", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem" }}
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