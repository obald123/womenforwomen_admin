"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, 
  ChevronDown, 
  User, 
  Settings, 
  Bell, 
  Search,
  ExternalLink
} from "lucide-react";
import { logout } from "../../../lib/apiClient";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-[100] h-20 w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        
        {/* LEFT: Logo & Context */}
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[14px] font-black leading-tight tracking-[0.2em] text-[#0D2323]">
              WOMEN FOR WOMEN
            </span>
            <span className="text-[11px] font-medium tracking-[0.3em] text-[#00A991]">
              RWANDA <span className="text-gray-300 mx-1">/</span> <span className="text-gray-400">ADMIN</span>
            </span>
          </div>

          <div className="hidden md:flex items-center relative group">
            <Search size={16} className="absolute left-0 text-[#0D2323]/30 group-focus-within:text-[#00A991] transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH RECORDS"
              className="bg-transparent pl-8 pr-4 py-2 text-[10px] font-bold tracking-[0.2em] text-[#0D2323] outline-none placeholder:text-gray-300 w-48 focus:w-64 transition-all"
            />
          </div>
        </div>

        {/* RIGHT: Navigation & Profile */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Top nav removed per request */}

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#0D2323] hover:text-[#00A991] transition-colors">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00A991] rounded-full" />
            </button>

            <div className="h-8 w-px bg-gray-100 mx-2" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 py-2 transition-all group"
              >
                <div className="flex flex-col items-end mr-1">
                  <span className="text-[10px] font-black tracking-widest text-[#0D2323]">ADMIN</span>
                  <span className="text-[9px] font-bold text-[#00A991]">ONLINE</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-[#F2F2F2] flex items-center justify-center border border-gray-100 group-hover:border-[#00A991] transition-colors">
                  <User size={18} className="text-[#0D2323]" />
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown - Clean & Sharp */}
              {isOpen && (
                <div className="absolute right-0 mt-4 w-52 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-2 z-[110]">
                  <DropdownItem icon={<Settings size={14}/>} label="SETTINGS" />
                  <DropdownItem icon={<ExternalLink size={14}/>} label="LIVE SITE" />
                  <div className="h-px bg-gray-50 my-2 mx-4" />
                  <button 
                    onClick={() => {
                      logout().finally(() => router.push("/"));
                    }}
                    className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black text-red-500 hover:bg-red-50 tracking-[0.2em]"
                  >
                    <LogOut size={14} />
                    <span>LOGOUT</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`text-[11px] font-bold tracking-[0.25em] transition-colors hover:text-[#00A991] ${active ? 'text-[#00A991]' : 'text-[#0D2323]'}`}>
      {label}
    </button>
  );
}

function DropdownItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-bold text-[#0D2323] hover:bg-gray-50 tracking-[0.2em] transition-colors">
      {icon}
      <span>{label}</span>
    </button>
  );
}
