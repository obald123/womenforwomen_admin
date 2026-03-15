"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, FileText, Search, MoreHorizontal } from "lucide-react";
import Modal from "../components/Modal";
import DataStore from "../../../lib/dataStore";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  function fetchItems() {
    const list = DataStore.list("news") || [];
    setItems(Array.isArray(list) ? [...list] : []);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload: Record<string, any> = {};
    for (const [k, v] of fd.entries()) {
      if (!(v instanceof File)) payload[k] = v;
    }
    payload.createdAt = new Date().toISOString();
    payload.status = "Published"; // Default status
    DataStore.add("news", payload as any);
    setOpen(false);
    fetchItems();
  }

  function handleDelete(id: string) {
    if(confirm("Are you sure you want to remove this article?")) {
      DataStore.remove("news", id);
      fetchItems();
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          
          {/* HEADER AREA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#00A991]" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Newsroom</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D2323] uppercase">
                Articles <span className="text-gray-300">& Records</span>
              </h1>
            </div>
            
            <button 
              onClick={() => setOpen(true)} 
              className="flex items-center gap-3 bg-[#0D2323] text-white px-8 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all hover:bg-[#00A991] shadow-[4px_4px_0px_0px_rgba(0,169,145,0.2)]"
            >
              <Plus size={16} strokeWidth={3} />
              New Entry
            </button>
          </div>

          {/* TABLE ACTIONS */}
          <div className="flex items-center justify-between mb-6 bg-white border border-[#F2F2F2] p-4">
            <div className="relative flex items-center w-full max-w-md">
              <Search size={14} className="absolute left-4 text-gray-400" />
              <input 
                type="text"
                placeholder="FILTER ARTICLES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-2 text-[10px] font-bold tracking-widest outline-none"
              />
            </div>
            <div className="hidden md:flex gap-4">
               <span className="text-[10px] font-black text-gray-300 tracking-widest">TOTAL: {items.length}</span>
            </div>
          </div>

          {/* EDITORIAL TABLE */}
          <div className="bg-white border border-[#F2F2F2] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#F2F2F2] bg-[#FAFAFA]">
                  <th className="text-left px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Date</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Headline</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Status</th>
                  <th className="text-right px-8 py-5 text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                       <p className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase">No matching articles found</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((it) => (
                    <tr key={it.id} className="group hover:bg-[#F9F9F9] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-gray-400 tabular-nums uppercase">
                          {new Date(it.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black tracking-tight text-[#0D2323] uppercase line-clamp-1">{it.title}</span>
                          <span className="text-[10px] font-medium text-gray-400 mt-1 line-clamp-1 italic">{it.content?.substring(0, 60)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="px-3 py-1 bg-[#00A991]/10 text-[#00A991] text-[9px] font-black tracking-widest uppercase rounded-full">
                          Live
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-4">
                          <button className="text-gray-300 hover:text-[#0D2323] transition-colors">
                             <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(it.id)}
                            className="text-gray-300 hover:text-red-600 transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CREATE MODAL */}
          <Modal open={open} onClose={() => setOpen(false)} title="NEW ARTICLE ENTRY">
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Headline</label>
                <input name="title" required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Article Content</label>
                <textarea name="content" required rows={5} className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-medium outline-none transition-all" />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">PUBLISH</button>
              </div>
            </form>
          </Modal>

        </div>
      </main>
    </div>
  );
}