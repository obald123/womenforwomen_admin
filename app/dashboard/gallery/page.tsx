"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Maximize2, Camera, UploadCloud, Pencil } from "lucide-react";
import Modal from "../components/Modal";
import { apiFetch, formatApiError, resolveAssetUrl } from "../../../lib/apiClient";
import { toast } from "react-toastify";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any | null>(null);

  function fetchItems() {
    apiFetch<any>("/api/gallery")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    fd.append("layout", "GRID");
    fd.append("status", "PUBLISHED");

    apiFetch("/api/gallery", { method: "POST", body: fd })
      .then(() => {
        setOpen(false);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function handleDeleteRequest(item: any) {
    setDeleteItem(item);
    setDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteItem) return;
    apiFetch(`/api/gallery/${deleteItem.id}`, { method: "DELETE" })
      .then(() => {
        setDeleteOpen(false);
        setDeleteItem(null);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function handleEdit(item: any) {
    setEditItem(item);
    setEditOpen(true);
  }

  function handleView(item: any) {
    setViewItem(item);
    setViewOpen(true);
  }

  function handleUpdate(form: HTMLFormElement) {
    if (!editItem) return;
    const fd = new FormData(form);
    const title = String(fd.get("title") || "");
    apiFetch(`/api/gallery/${editItem.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
        layout: editItem.layout,
        status: editItem.status,
      }),
    })
      .then(() => {
        setEditOpen(false);
        setEditItem(null);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
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
                  {Array.isArray(it.images) && it.images[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveAssetUrl(it.images[0].url)} alt={it.title} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(it)} className="bg-white p-2 text-[#0D2323] hover:text-[#00A991] mr-2">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleView(it)} className="bg-white p-2 text-[#0D2323] hover:text-[#00A991]">
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
                      {new Date(it.createdAt).toLocaleDateString("en-GB")} • {it.images?.length || 0} FILES
                    </p>
                  </div>
                  <button onClick={() => handleDeleteRequest(it)} className="text-gray-300 hover:text-red-600 transition-colors p-1">
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

          {/* EDIT MODAL */}
          <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditItem(null); }} title="EDIT GALLERY">
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Gallery Title</label>
                <input name="title" defaultValue={editItem?.title || ""} required className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none uppercase tracking-widest" />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => { setEditOpen(false); setEditItem(null); }} className="text-[10px] font-black tracking-[0.3em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">SAVE CHANGES</button>
              </div>
            </form>
          </Modal>

          {/* DELETE CONFIRMATION */}
          <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteItem(null); }} title="DELETE GALLERY">
            <div className="space-y-4">
              <p className="text-sm text-[#0D2323]">Are you sure you want to delete this gallery?</p>
              {deleteItem?.title && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {deleteItem.title}
                </p>
              )}
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => { setDeleteOpen(false); setDeleteItem(null); }} className="text-[10px] font-black tracking-[0.2em] text-gray-400">
                  CANCEL
                </button>
                <button type="button" onClick={handleDeleteConfirm} className="bg-red-600 text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-red-700 transition-all">
                  DELETE
                </button>
              </div>
            </div>
          </Modal>

          {/* VIEW MODAL */}
          <Modal open={viewOpen} onClose={() => { setViewOpen(false); setViewItem(null); }} title="GALLERY PREVIEW">
            {viewItem && (
              <div className="space-y-4">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0D2323]">
                  {viewItem.title || "Untitled Gallery"}
                </div>
                <div className="text-[10px] text-gray-400">
                  {new Date(viewItem.createdAt).toLocaleDateString("en-GB")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.isArray(viewItem.images) && viewItem.images.length > 0 ? (
                    viewItem.images.map((img: any, idx: number) => (
                      <div key={idx} className="border border-[#F2F2F2] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveAssetUrl(img.url)} alt={img.caption || viewItem.title} className="w-full h-56 object-cover" />
                        {img.caption && (
                          <div className="p-2 text-[10px] text-gray-500">{img.caption}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-gray-400">No images in this gallery.</div>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => { setViewOpen(false); setViewItem(null); }} className="bg-[#0D2323] text-white px-6 py-2 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">
                    CLOSE
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
}
