"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", price: 580 },
  { month: "Feb", price: 595 },
  { month: "Mar", price: 610 },
  { month: "Apr", price: 625 },
  { month: "May", price: 618 },
  { month: "Jun", price: 640 },
];

export default function BrassTrendChart() {
  return (
    <div className="bg-[#1B2940] rounded-3xl p-8 h-[500px]">
      <h2 className="text-white text-3xl font-bold mb-8">
        Brass Price Trend
      </h2>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#D4AF37"
            strokeWidth={4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}