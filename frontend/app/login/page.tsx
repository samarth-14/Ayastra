"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      email === "admin@ayastra.com" &&
      password === "123456"
    ) {
      router.push("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };
  const handleGoogleLogin = () => {
    router.push("/dashboard");
  };
  const handleSignup = (e: React.FormEvent) => {
  e.preventDefault();
  if (email && password) {
    alert("Account Created Successfully!");
    router.push("/dashboard");
  }
};
  return (
    <div className="min-h-screen bg-[#081329] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-700 bg-[#081329] shadow-2xl px-10 py-14">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-7xl font-extrabold text-[#D4AF37] tracking-wide">
            AYASTRA
          </h1>
          <p className="text-slate-400 text-xl mt-4">
  {isSignup
    ? "Create your AYASTRA account"
    : "Manufacturing Intelligence Dashboard"}
</p>
        </div>
        {/* Google Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full max-w-3xl bg-white text-black border-2 border-slate-400 rounded-2xl py-5 text-2xl font-semibold hover:bg-slate-100 transition"
          >
            Continue with Google
          </button>
        </div>
        {/* Divider */}
        <div className="flex items-center gap-6 my-10">
          <div className="flex-1 h-[1px] bg-slate-600" />
          <span className="text-slate-400 text-2xl">or</span>
          <div className="flex-1 h-[1px] bg-slate-600" />
        </div>
        {/* Form */}
        <form
          onSubmit={isSignup ? handleSignup : handleLogin}
  className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <label className="block text-white text-xl mb-3 font-medium uppercase">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-transparent border border-slate-600 rounded-2xl px-6 py-5 text-white text-xl outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-white text-xl mb-3 font-medium uppercase">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-transparent border border-slate-600 rounded-2xl px-6 py-5 text-white text-xl outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-10 bg-black text-white py-5 rounded-2xl text-3xl font-semibold hover:opacity-90 transition"
          >
            {isSignup ? "Create Account" : "Log in"}
          </button>
        </form>
        {/* Links */}
        <div className="text-center mt-10 space-y-5">
          <button className="text-blue-500 text-2xl hover:underline">
            Reset password
          </button>
          <div className="text-slate-400 text-xl">
            No account?{" "}
            <button
  onClick={() => setIsSignup(!isSignup)}
  className="text-blue-500 hover:underline"
>
  {isSignup
    ? "Already have an account? Login"
    : "Create one"}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}