"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Brass Rods", value: 40 },
  { name: "Brass Sheets", value: 25 },
  { name: "Brass Tubes", value: 20 },
  { name: "Scrap", value: 15 },
];

const COLORS = [
  "#D4AF37",
  "#B8860B",
  "#CBD5E1",
  "#10B981",
];

export default function InventoryPieChart() {
  return (
    <div className="bg-[#1B2940] rounded-3xl p-8 h-[500px]">
      <h2 className="text-white text-3xl font-bold mb-8">
        Inventory Distribution
      </h2>

      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}