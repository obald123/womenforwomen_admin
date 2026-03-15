"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Maximize2, Camera, UploadCloud } from "lucide-react";
import Modal from "../components/Modal";
import DataStore from "../../../lib/dataStore";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  function fetchItems() {
    const list = DataStore.list("gallery") || [];
    setItems(Array.isArray(list) ? [...list] : []);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload: Record<string, any> = {};
    const files: any[] = [];
    for (const [k, v] of fd.entries()) {
      if (v instanceof File && v.name) {
        files.push({ name: v.name, size: v.size, type: v.type, preview: URL.createObjectURL(v) });
      } else {
        payload[k] = v;
      }
    }
    payload.files = files;
    payload.createdAt = new Date().toISOString();
    DataStore.add("gallery", payload as any);
    setOpen(false);
    fetchItems();
  }

  function handleDelete(id: string) {
    if (confirm("Remove these assets from the gallery?")) {
      DataStore.remove("gallery", id);
      fetchItems();
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[3px] bg-[#00A991]" />
                <span className="text-[11px] font-black tracking-[0.4em] text-[#00A991] uppercase">Media Assets</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-[#0D2323] uppercase leading-none">
                Visual <span className="text-gray-200">Archive</span>
              </h1>
            </div>
            
            <button 
              onClick={() => setOpen(true)} 
              className="flex items-center gap-4 bg-[#0D2323] text-white px-10 py-5 text-[11px] font-black tracking-[0.3em] uppercase transition-all hover:bg-[#00A991] hover:-translate-y-1"
            >
              <Plus size={18} strokeWidth={3} />
              Upload Assets
            </button>
          </div>

          {/* MASONRY-STYLE GRID */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {items.length === 0 && (
              <div className="py-32 border-2 border-dashed border-[#F2F2F2] flex flex-col items-center justify-center text-gray-300 w-full col-span-full">
                <ImageIcon size={48} strokeWidth={1} className="mb-4 opacity-30" />
                <p className="text-[10px] font-black tracking-[0.3em] uppercase">No visual records found</p>
              </div>
            )}
            
            {items.map((it) => (
              <div 
                key={it.id} 
                className="break-inside-avoid bg-white border border-[#F2F2F2] p-4 transition-all hover:shadow-[20px_20px_0px_0px_rgba(13,35,35,0.03)] hover:border-[#0D2323] group"
              >
                {/* Image Placeholder/Preview */}
                <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform duration-700">
                    <Camera size={40} strokeWidth={1} />
                  </div>
                  {/* Note: In a real app, you'd use <img src={it.files[0].preview} /> here */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white p-2 text-[#0D2323] hover:text-[#00A991]">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-[12px] font-black tracking-widest uppercase truncate max-w-[150px]">
                      {it.title || "UNTITLED ASSET"}
                    </h3>
                    <p className="text-[9px] font-bold text-[#00A991] tracking-[0.1em]">
                      {new Date(it.createdAt).toLocaleDateString('en-GB')} • {it.files?.length || 0} FILES
                    </p>
                  </div>
                  <button onClick={() => handleDelete(it.id)} className="text-gray-300 hover:text-red-600 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* UPLOAD MODAL */}
          <Modal open={open} onClose={() => setOpen(false)} title="UPLOAD MEDIA">
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(e.currentTarget); }} className="space-y-8 p-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Gallery Title</label>
                <input name="title" required placeholder="E.G. KIGALI WORKSHOP 2026" className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none uppercase tracking-widest" />
              </div>

              <div className="relative border-2 border-dashed border-gray-200 p-12 text-center group hover:border-[#00A991] transition-colors">
                <input type="file" name="images" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-3">
                  <UploadCloud size={32} className="text-gray-300 group-hover:text-[#00A991] transition-colors" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#0D2323] uppercase">Drop assets here or click to browse</span>
                  <span className="text-[9px] font-bold text-gray-400">JPG, PNG, WEBP (MAX 10MB)</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-6 items-center">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.3em] text-gray-400">DISCARD</button>
                <button type="submit" className="bg-[#0D2323] text-white px-10 py-4 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-[#00A991] transition-all">
                  Process Upload
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  );
}