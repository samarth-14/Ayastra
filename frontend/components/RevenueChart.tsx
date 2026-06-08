"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 18000 },
  { month: "Apr", revenue: 16000 },
  { month: "May", revenue: 20000 },
  { month: "Jun", revenue: 22000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-[#1B2940] rounded-3xl p-8 h-[500px]">
      <h2 className="text-white text-3xl font-bold mb-8">
        Revenue Analytics
      </h2>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Bar
            dataKey="revenue"
            fill="#D4AF37"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}