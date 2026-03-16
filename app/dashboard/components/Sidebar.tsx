"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Newspaper, 
  CalendarDays, 
  Image as ImageIcon, 
  Users,
  Mail,
  MessageSquare,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

const mainNav = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "news", label: "News & Articles", icon: Newspaper },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "careers", label: "Careers", icon: Briefcase },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "team", label: "Team", icon: Users },
  { key: "newsletter", label: "Newsletter", icon: Mail },
];


export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname() || "";

  React.useEffect(() => {
    const onToggleMobile = () => setIsOpen((prev) => !prev);
    window.addEventListener("admin-sidebar-toggle-mobile", onToggleMobile as EventListener);
    return () => window.removeEventListener("admin-sidebar-toggle-mobile", onToggleMobile as EventListener);
  }, []);

  if (pathname === "/") return null;

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[150] bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`transition-all duration-500 border-r border-[#F2F2F2] bg-white h-screen flex flex-col z-[160]
          fixed top-0 left-0 lg:sticky
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          ${isCollapsed ? "lg:w-[88px]" : "lg:w-[300px]"} w-[300px]
        `}
      >
      {/* 1. BRAND AREA: High-Contrast & Bold */}
      <div className={`h-24 flex items-center ${isCollapsed ? "lg:px-0 lg:justify-center" : "px-12"}`}>
        <Link href="/dashboard" className="flex items-center gap-5">
          <div className="relative h-10 w-32 lg:hidden">
            <Image src="/images/site/logo.png" alt="Women for Women Rwanda" fill sizes="128px" className="object-contain" />
          </div>
          {!isCollapsed && (
            <div className="relative h-10 w-32 hidden lg:block">
              <Image src="/images/site/logo.png" alt="Women for Women Rwanda" fill sizes="128px" className="object-contain" />
            </div>
          )}
        </Link>
      </div>

      {/* 2. MAIN NAVIGATION: Spaced Hierarchy */}
      <div className="flex-1 flex flex-col justify-between pt-8">
        <nav className="space-y-1">
          <span className={`text-[9px] font-black tracking-[0.4em] text-gray-300 block mb-6 ${isCollapsed ? "lg:text-center lg:px-0" : "px-12"}`}>MENU</span>
          
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.includes(`/dashboard/${item.key}`) || (pathname === "/dashboard" && item.key === "overview");
            
            return (
              <SidebarLink 
                key={item.key}
                item={item} 
                active={active} 
                Icon={Icon} 
                onClick={() => setIsOpen(false)}
                collapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* 3. SECONDARY NAV removed per request */}
      </div>

        {/* 4. FOOTER: The Reveal/Hide Mechanism */}
      <div className="h-16 border-t border-[#F2F2F2] flex items-center justify-center px-4">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="hidden lg:inline-flex items-center justify-center h-9 w-9 rounded border border-gray-100 text-[#0D2323] hover:text-[#00A991] transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        </button>
      </div>
    </aside>
    </>
  );
}

function SidebarLink({ item, active, Icon, onClick, collapsed }: any) {
  return (
    <Link
      href={`/dashboard/${item.key === "overview" ? "" : item.key}`}
      onClick={onClick}
      className={`group relative flex items-center transition-all duration-500 py-4 ${
        active ? "text-[#00A991]" : "text-[#0D2323]/40 hover:text-[#0D2323]"
      } ${collapsed ? "lg:px-0 lg:justify-center" : "px-12"}`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 1.5} className="z-10 transition-transform group-hover:scale-110" />
      
      <span className="ml-6 text-[11px] font-black tracking-[0.25em] uppercase z-10 lg:hidden">
        {item.label}
      </span>
      {!collapsed && (
        <span className="ml-6 text-[11px] font-black tracking-[0.25em] uppercase z-10 hidden lg:inline">
          {item.label}
        </span>
      )}

      {/* Modern Hover Effect: Thin Vertical Line */}
      <div className={`absolute left-0 h-full bg-[#0D2323] transition-all duration-500 ${
        active ? "w-1" : "w-0 group-hover:w-1"
      }`} />
      
      {/* Background slide for active item */}
      {active && (
        <div className="absolute inset-0 bg-gray-50/50 -z-0 animate-in fade-in duration-700" />
      )}
    </Link>
  );
}
