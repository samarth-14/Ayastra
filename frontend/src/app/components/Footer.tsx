import { motion } from "motion/react";

const links = {
  Platform: ["Features", "Dashboard", "Analytics", "Pricing"],
  Company: ["Documentation", "Blog", "Careers", "Contact"],
};

export function Footer() {
  return (
    <footer className="relative border-t overflow-hidden" style={{ background: "#0B1120", borderColor: "rgba(59,130,246,0.12)" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(245,158,11,0.03) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <polygon points="9,1 17,5 17,13 9,17 1,13 1,5" stroke="white" strokeWidth="1.5" fill="none"/>
                  <polygon points="9,5 13,7 13,11 9,13 5,11 5,7" fill="white" opacity="0.8"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.02em" }}>
                AYASTRA
              </span>
            </div>
            <p style={{ color: "#8892a4", fontSize: "0.9rem", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: "340px" }}>
              The AI Operating System for the Metal Industry. Trusted by manufacturers, wholesalers, traders, and recyclers across India.
            </p>
            <div className="flex gap-3 mt-6">
              {/* LinkedIn */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200"
                style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; e.currentTarget.style.background = "rgba(59,130,246,0.06)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#93C5FD">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </motion.a>
              {/* GitHub */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200"
                style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; e.currentTarget.style.background = "rgba(59,130,246,0.06)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#93C5FD">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </motion.a>
              {/* X / Twitter */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200"
                style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; e.currentTarget.style.background = "rgba(59,130,246,0.06)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#93C5FD">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#e8eaf0", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#"
                      style={{ color: "#8892a4", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#e8eaf0")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#8892a4")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: "rgba(59,130,246,0.1)" }}>
          <p style={{ color: "#8892a4", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace" }}>
            © 2024 Ayastra Technologies Pvt. Ltd. · Made in India
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Security"].map((item) => (
              <a key={item} href="#"
                style={{ color: "#8892a4", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e8eaf0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8892a4")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
