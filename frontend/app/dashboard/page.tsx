import StatCard from "@/components/StatCard";
import BrassTrendChart from "@/components/BrassTrendChart";
import InventoryPieChart from "@/components/InventoryPieChart";
import RevenueChart from "@/components/RevenueChart";
import InventoryTable from "@/components/InventoryTable";
import AnalyticsCard from "@/components/AnalyticsCard";

export default function DashboardPage() {
  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Products" value="1250" />
        <StatCard title="Current Brass Rate" value="₹640/kg" />
        <StatCard title="Scrap Stock" value="150kg" />
        <StatCard title="Revenue" value="₹2.45L" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <BrassTrendChart />
        <InventoryPieChart />
        <RevenueChart />
      </div>

      {/* Inventory Table */}
      <InventoryTable />

      {/* Analytics */}
      <div className="mt-10">
        <h2 className="text-white text-4xl font-bold mb-6">
          Analytics Overview
        </h2>

        <div className="grid grid-cols-4 gap-6">
          <AnalyticsCard
            title="Inventory Value"
            value="₹2,45,000"
            subtitle="Total value of current stock"
          />

          <AnalyticsCard
            title="Revenue Forecast"
            value="₹3,20,000"
            subtitle="Next month projection"
          />

          <AnalyticsCard
            title="Scrap Performance"
            value="85%"
            subtitle="Optimization efficiency"
          />

          <AnalyticsCard
            title="Market Trend"
            value="Bullish"
            subtitle="Current market sentiment"
          />
        </div>
      </div>
    </div>
  );
}