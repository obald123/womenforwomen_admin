"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Calendar as CalIcon, MapPin, Clock, MoreHorizontal, FilePlus } from "lucide-react";
import Modal from "../components/Modal";
import DataStore from "../../../lib/dataStore";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  function fetchItems() {
    const list = DataStore.list("events") || [];
    setItems(Array.isArray(list) ? [...list] : []);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload: Record<string, any> = {};
    for (const [k, v] of fd.entries()) {
      if (!(v instanceof File)) payload[k] = v;
    }
    payload.createdAt = new Date().toISOString();
    DataStore.add("events", payload as any);
    setOpen(false);
    fetchItems();
  }

  function handleDelete(id: string) {
    if(confirm("Permanently delete this event record?")) {
      DataStore.remove("events", id);
      fetchItems();
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          
          {/* SECTION HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[3px] bg-[#00A991]" />
                <span className="text-[11px] font-black tracking-[0.4em] text-[#00A991] uppercase">Scheduling</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-[#0D2323] uppercase leading-none">
                Upcoming <span className="text-gray-200">Events</span>
              </h1>
            </div>
            
            <button 
              onClick={() => setOpen(true)} 
              className="flex items-center gap-4 bg-[#0D2323] text-white px-10 py-5 text-[11px] font-black tracking-[0.3em] uppercase transition-all hover:bg-[#00A991] hover:-translate-y-1 active:translate-y-0"
            >
              <Plus size={18} strokeWidth={3} />
              Schedule Event
            </button>
          </div>

          {/* EVENTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {items.length === 0 && (
              <div className="col-span-full py-32 border-2 border-dashed border-[#F2F2F2] flex flex-col items-center justify-center text-gray-300">
                <FilePlus size={48} strokeWidth={1} className="mb-4 opacity-30" />
                <p className="text-[10px] font-black tracking-[0.3em] uppercase">No programmed events found</p>
              </div>
            )}
            
            {items.map((it) => (
              <div 
                key={it.id} 
                className="group relative bg-white border border-[#F2F2F2] p-8 transition-all hover:shadow-[30px_30px_0px_0px_rgba(0,169,145,0.05)] hover:border-[#00A991]"
              >
                {/* Vertical Date Accent */}
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#0D2323] text-white px-4 py-2 flex flex-col items-center">
                  <span className="text-[14px] font-black leading-none">
                    {it.date ? new Date(it.date).getDate() : '--'}
                  </span>
                  <span className="text-[8px] font-bold tracking-widest uppercase opacity-60">
                    {it.date ? new Date(it.date).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}
                  </span>
                </div>

                <div className="mb-10">
                  <h3 className="text-2xl font-[900] leading-[1.1] mb-4 uppercase tracking-tighter group-hover:text-[#00A991] transition-colors">
                    {it.name || it.title}
                  </h3>
                  <p className="text-[12px] text-gray-400 font-medium leading-relaxed line-clamp-3">
                    {it.description}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-[#0D2323]">
                    <Clock size={14} className="text-[#00A991]" />
                    <span className="text-[10px] font-black tracking-widest uppercase">09:00 AM CAT</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#0D2323]">
                    <MapPin size={14} className="text-[#00A991]" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Kigali Headquarters</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                   <button className="text-[10px] font-black tracking-[0.3em] uppercase text-[#0D2323] border-b-2 border-[#00A991] pb-1">
                     Manage List
                   </button>
                   <button onClick={() => handleDelete(it.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EDITORIAL MODAL */}
          <Modal open={open} onClose={() => setOpen(false)} title="SCHEDULE NEW EVENT">
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(e.currentTarget); }} className="space-y-8 p-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Event Title</label>
                  <input name="name" required className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none uppercase tracking-widest" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Date</label>
                  <input type="date" name="date" required className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Category</label>
                  <select className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none">
                    <option>WORKSHOP</option>
                    <option>CONFERENCE</option>
                    <option>FUNDRAISER</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Event Brief</label>
                <textarea name="description" rows={4} className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-medium leading-relaxed outline-none" />
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-6 items-center">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.3em] text-gray-400">DISCARD</button>
                <button type="submit" className="bg-[#00A991] text-white px-10 py-4 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-[#0D2323] transition-all">
                  Confirm Event
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  );
}