"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary Login
    if (
      email === "admin@ayastra.com" &&
      password === "123456"
    ) {
      router.push("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#081329] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1B2940] rounded-3xl p-10 shadow-2xl border border-slate-700">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#D4AF37]">
            AYASTRA
          </h1>

          <p className="text-slate-400 mt-3">
            Manufacturing Intelligence Dashboard
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block text-slate-300 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center text-slate-400 text-sm">
          Demo Credentials:
          <br />
          admin@ayastra.com
          <br />
          123456
        </div>
      </div>
    </div>
  );
}