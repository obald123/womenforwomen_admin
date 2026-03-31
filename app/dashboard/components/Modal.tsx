"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function Modal({ open, onClose, title, subtitle, children }: Props) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with premium blur */}
      <div 
        className="absolute inset-0 bg-[#0D2323]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative z-[301] w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        {/* Header Section */}
        <div className="relative px-8 pt-8 pb-6 border-b border-[#FAF9F6]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h3 className="text-[28px] font-black text-[#0D2323] leading-none tracking-tighter uppercase">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-2 text-[11px] font-bold text-[#00A991] uppercase tracking-[0.2em]">
                  {subtitle}
                </p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 -mr-2 text-[#6B7574] hover:text-[#0D2323] hover:bg-[#FAF9F6] rounded-full transition-all group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          {/* Decorative Teal Line */}
          <div className="absolute bottom-0 left-0 h-[2px] w-20 bg-[#007A71]" />
        </div>

        {/* Content Section */}
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Optional: Design accent on the bottom */}
        <div className="h-1 w-full bg-gradient-to-r from-[#0D2323] via-[#007A71] to-[#00A991] opacity-10" />
      </div>
    </div>
  );
}