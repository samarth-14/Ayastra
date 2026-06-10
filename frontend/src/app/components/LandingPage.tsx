import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { MarketTicker } from "./MarketTicker";
import { FeaturesSection } from "./FeaturesSection";
import { DashboardSection } from "./DashboardSection";
import { AnalyticsSection } from "./AnalyticsSection";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#050816", scrollBehavior: "smooth" }}>
      {/* MARKER-MAKE-KIT-INVOKED */}
      <Navbar />
      <HeroSection />
      <MarketTicker />
      <FeaturesSection />
      <DashboardSection />
      <AnalyticsSection />
      <Footer />
    </div>
  );
}
