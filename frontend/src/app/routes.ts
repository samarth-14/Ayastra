import { createBrowserRouter } from "react-router";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { SmartInventoryPage } from "./components/features/SmartInventoryPage";
import { WhatsAppAutomationPage } from "./components/features/WhatsAppAutomationPage";
import { MetalPricePage } from "./components/features/MetalPricePage";
import { BusinessAnalyticsPage } from "./components/features/BusinessAnalyticsPage";
import { ScrapOptimizerPage } from "./components/features/ScrapOptimizerPage";
import { ScrapOptimizerDashboard } from "./components/dashboard/ScrapOptimizerDashboard";
import { DashboardApp } from "./components/dashboard/DashboardApp";
import { SignupPage } from "./components/SignupPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { DashboardInventory } from "./components/dashboard/DashboardInventory";
import { DashboardOrders } from "./components/dashboard/DashboardOrders";
import { DashboardMarkets } from "./components/dashboard/DashboardMarkets";
import { DashboardAnalytics } from "./components/dashboard/DashboardAnalytics";
import { DashboardSettings } from "./components/dashboard/DashboardSettings";
import { DashboardPredictions } from "./components/dashboard/DashboardPredictions";

export const router = createBrowserRouter([
  { path: "/",                              Component: HomePage },
  { path: "/login",                         Component: LoginPage },
  { path: "/signup",                        Component: SignupPage },
  { path: "/onboarding",                    Component: OnboardingPage },
  { path: "/features/smart-inventory",      Component: SmartInventoryPage },
  { path: "/features/whatsapp-automation",  Component: WhatsAppAutomationPage },
  { path: "/features/metal-price",          Component: MetalPricePage },
  { path: "/features/business-analytics",   Component: BusinessAnalyticsPage },
  { path: "/features/scrap-optimizer",      Component: ScrapOptimizerPage },
  {
    path: "/dashboard",
    Component: DashboardApp,
    children: [
      { index: true,         Component: DashboardHome },
      { path: "inventory",   Component: DashboardInventory },
      { path: "orders",      Component: DashboardOrders },
      { path: "markets",     Component: DashboardMarkets },
      { path: "analytics",   Component: DashboardAnalytics },
      { path: "settings",    Component: DashboardSettings },
      { path: "predictions", Component: DashboardPredictions },
      { path: "scrap-optimizer", Component: ScrapOptimizerDashboard },
    ],
  },
]);
