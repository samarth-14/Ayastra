export default function Navbar() {
  return (
    <header className="h-20 border-b border-slate-700 bg-[#081329] px-8 flex items-center justify-between">
      <h1 className="text-5xl font-bold text-[#D4AF37]">
        AYASTRA
      </h1>
      <div className="flex items-center gap-6">
        <button className="text-white text-2xl">
          🔔
        </button>
        <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">
          K
        </div>
      </div>
    </header>
  );
}