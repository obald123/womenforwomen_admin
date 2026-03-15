"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Newspaper, 
  CalendarDays, 
  Image as ImageIcon, 
  Users,
  Mail,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

const mainNav = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "news", label: "News & Articles", icon: Newspaper },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "team", label: "Team", icon: Users },
  { key: "newsletter", label: "Newsletter", icon: Mail },
];


export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname() || "";

  if (pathname === "/") return null;

  return (
    <aside 
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) border-r border-[#F2F2F2] bg-white h-screen hidden lg:flex flex-col sticky top-0 z-[120] ${
        isCollapsed ? "w-[72px]" : "w-[300px]"
      }`}
    >
      {/* 1. BRAND AREA: High-Contrast & Bold */}
      <div className={`h-24 flex items-center ${isCollapsed ? "justify-center" : "px-12"}`}>
        <Link href="/dashboard" className="flex items-center gap-5 group">
           <div className="relative flex h-10 w-10 items-center justify-center bg-[#0D2323] overflow-hidden">
              <span className="text-white text-[12px] font-black z-10">W.</span>
              <div className="absolute inset-0 bg-[#00A991] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
           </div>
           {!isCollapsed && (
             <div className="flex flex-col overflow-hidden">
               <span className="text-[14px] font-[900] tracking-[0.3em] text-[#0D2323] animate-in slide-in-from-left duration-500">RWANDA</span>
               <div className="h-[2px] w-full bg-[#00A991] mt-1 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
             </div>
           )}
        </Link>
      </div>

      {/* 2. MAIN NAVIGATION: Spaced Hierarchy */}
      <div className="flex-1 flex flex-col justify-between pt-8">
        <nav className="space-y-1">
          {!isCollapsed && (
            <span className="px-12 text-[9px] font-black tracking-[0.4em] text-gray-300 block mb-6">MENU</span>
          )}
          
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.includes(`/dashboard/${item.key}`) || (pathname === "/dashboard" && item.key === "overview");
            
            return (
              <SidebarLink 
                key={item.key}
                item={item} 
                active={active} 
                isCollapsed={isCollapsed} 
                Icon={Icon} 
              />
            );
          })}
        </nav>

        {/* 3. SECONDARY NAV removed per request */}
      </div>

      {/* 4. FOOTER: The Reveal/Hide Mechanism */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-16 border-t border-[#F2F2F2] flex items-center justify-center hover:bg-gray-50 transition-colors group"
      >
        {isCollapsed ? (
          <ArrowRight size={16} className="text-[#0D2323] group-hover:translate-x-1 transition-transform" />
        ) : (
          <div className="flex items-center gap-3 text-[#0D2323]">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black tracking-[0.4em]">MINIMIZE</span>
          </div>
        )}
      </button>
    </aside>
  );
}

function SidebarLink({ item, active, isCollapsed, Icon }: any) {
  return (
    <Link
      href={`/dashboard/${item.key === "overview" ? "" : item.key}`}
      className={`group relative flex items-center transition-all duration-500 ${
        isCollapsed ? "justify-center py-6" : "px-12 py-4"
      } ${
        active ? "text-[#00A991]" : "text-[#0D2323]/40 hover:text-[#0D2323]"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 1.5} className="z-10 transition-transform group-hover:scale-110" />
      
      {!isCollapsed && (
        <span className="ml-6 text-[11px] font-black tracking-[0.25em] uppercase z-10">
          {item.label}
        </span>
      )}

      {/* Modern Hover Effect: Thin Vertical Line */}
      <div className={`absolute left-0 h-full bg-[#0D2323] transition-all duration-500 ${
        active ? "w-1" : "w-0 group-hover:w-1"
      }`} />
      
      {/* Background slide for active item */}
      {active && !isCollapsed && (
        <div className="absolute inset-0 bg-gray-50/50 -z-0 animate-in fade-in duration-700" />
      )}
    </Link>
  );
}
