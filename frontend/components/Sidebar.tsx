import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Recycle,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#081329] border-r border-slate-700 text-white flex flex-col">
      <div className="p-8">
        <h1 className="text-5xl font-bold text-[#D4AF37]">
          AYASTRA
        </h1>
      </div>

      <nav className="px-4 flex-1">
        <Link
          href="/"
          className="flex items-center gap-4 bg-[#D4AF37] text-black rounded-2xl px-6 py-4 mb-4 font-semibold"
        >
          <LayoutDashboard size={22} />
          Dashboard
        </Link>

        <Link
          href="/inventory"
          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800 rounded-2xl"
        >
          <Package size={22} />
          Inventory
        </Link>

        <Link
          href="/brass-prices"
          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800 rounded-2xl"
        >
          <TrendingUp size={22} />
          Brass Prices
        </Link>

        <Link
          href="/scrap-optimizer"
          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800 rounded-2xl"
        >
          <Recycle size={22} />
          Scrap Optimizer
        </Link>

        <Link
          href="/analytics"
          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800 rounded-2xl"
        >
          <BarChart3 size={22} />
          Analytics
        </Link>

        <button className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800 rounded-2xl w-full text-left">
          <Settings size={22} />
          Settings
        </button>
      </nav>

      <div className="p-6">
        <div className="w-12 h-12 rounded-full bg-black border border-slate-600 flex items-center justify-center">
          K
        </div>
      </div>
    </aside>
  );
}