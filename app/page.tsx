"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      localStorage.setItem("auth", "1");
    } catch {}
    router.push("/dashboard/news");
  }

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] selection:bg-[#007A71]/20">
      {/* Left Side: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D2323] relative items-center justify-center overflow-hidden">
        {/* Abstract decorative elements to match Figma vibe */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#007A71] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#00A991] rounded-full blur-[120px] opacity-10" />
        
        <div className="relative z-10 px-12 text-center">
          <div className="mb-8 flex justify-center">
             <div className="p-4 bg-[#007A71] rounded-2xl shadow-2xl">
                <ShieldCheck size={48} className="text-white" />
             </div>
          </div>
          <h2 className="text-white text-4xl font-black tracking-tighter uppercase leading-none">
            Women for <br />
            <span className="text-[#00A991] font-light italic">Women</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-sm mx-auto text-lg font-light leading-relaxed">
            Internal Administrative Portal for content management and impact reporting.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-[42px] font-black text-[#0D2323] leading-none tracking-tighter uppercase">
              Sign In
            </h1>
            <div className="h-1 w-12 bg-[#007A71] mt-4" />
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6362]">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007A71] transition-colors">
                  <User size={18} />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#EDECE8] rounded-sm text-sm focus:outline-none focus:border-[#007A71] focus:ring-1 focus:ring-[#007A71] transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A6362]">
                  Password
                </label>
                
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#007A71] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#EDECE8] rounded-sm text-sm focus:outline-none focus:border-[#007A71] focus:ring-1 focus:ring-[#007A71] transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center group cursor-pointer w-fit">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer h-4 w-4 border-[#EDECE8] rounded-sm checked:bg-[#007A71] transition-all appearance-none border cursor-pointer" 
                />
                <ShieldCheck className="absolute h-3 w-3 text-white left-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="ml-3 text-sm text-[#6B7574] group-hover:text-[#0D2323] transition-colors">
                Remember this session
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0D2323] hover:bg-[#1a3a3a] text-white py-4 rounded-sm font-bold uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl hover:shadow-[#0D2323]/20 group"
            >
              Access Portal
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer Info */}
          <p className="mt-12 text-center text-xs text-[#6B7574] leading-relaxed">
            By logging in, you agree to the internal data <br /> 
            protection and confidentiality policies.
          </p>
        </div>
      </main>
    </div>
  );
}