"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, MapPin, Clock, FilePlus, Pencil } from "lucide-react";
import Modal from "../components/Modal";
import { apiFetch, formatApiError } from "../../../lib/apiClient";
import { toast } from "react-toastify";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  function fetchItems() {
    apiFetch<any>("/api/events")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    const title = String(fd.get("name") || "");
    const excerpt = String(fd.get("excerpt") || "");
    const description = String(fd.get("description") || "");
    if (excerpt.length < 10) {
      toast.error("Short description must be at least 10 characters");
      return;
    }
    if (description.length < 20) {
      toast.error("Event details must be at least 20 characters");
      return;
    }

    const payload = new FormData();
    payload.append("title", title);
    payload.append("excerpt", excerpt);
    payload.append("content", description);
    payload.append("eventDate", String(fd.get("date") || ""));
    payload.append("location", String(fd.get("location") || ""));
    payload.append("isOnline", fd.get("isOnline") ? "true" : "false");
    payload.append("badgeLabel", String(fd.get("badgeLabel") || ""));
    payload.append("isFeatured", fd.get("isFeatured") ? "true" : "false");
    payload.append("status", "PUBLISHED");
    const cover = fd.get("coverImage");
    if (cover instanceof File && cover.size > 0) payload.append("coverImage", cover);

    apiFetch("/api/events", { method: "POST", body: payload })
      .then(() => {
        setOpen(false);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function handleDelete(id: string) {
    if(confirm("Permanently delete this event record?")) {
      apiFetch(`/api/events/${id}`, { method: "DELETE" })
        .then(() => fetchItems())
        .catch((err) => toast.error(formatApiError(err)));
    }
  }

  function handleEdit(item: any) {
    setEditItem(item);
    setEditOpen(true);
  }

  function handleUpdate(form: HTMLFormElement) {
    if (!editItem) return;
    const fd = new FormData(form);
    const title = String(fd.get("name") || "");
    const excerpt = String(fd.get("excerpt") || "");
    const description = String(fd.get("description") || "");
    if (excerpt.length < 10) {
      toast.error("Short description must be at least 10 characters");
      return;
    }
    if (description.length < 20) {
      toast.error("Event details must be at least 20 characters");
      return;
    }

    const payload = new FormData();
    payload.append("title", title);
    payload.append("excerpt", excerpt);
    payload.append("content", description);
    payload.append("eventDate", String(fd.get("date") || ""));
    payload.append("location", String(fd.get("location") || editItem.location || ""));
    payload.append("isOnline", fd.get("isOnline") ? "true" : "false");
    payload.append("badgeLabel", String(fd.get("badgeLabel") || ""));
    payload.append("isFeatured", fd.get("isFeatured") ? "true" : "false");
    payload.append("status", editItem.status || "PUBLISHED");
    const cover = fd.get("coverImage");
    if (cover instanceof File && cover.size > 0) payload.append("coverImage", cover);

    apiFetch(`/api/events/${editItem.id}`, { method: "PATCH", body: payload })
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
                    {it.eventDate ? new Date(it.eventDate).getDate() : '--'}
                  </span>
                  <span className="text-[8px] font-bold tracking-widest uppercase opacity-60">
                    {it.eventDate ? new Date(it.eventDate).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}
                  </span>
                </div>

                <div className="mb-10">
                  <h3 className="text-2xl font-[900] leading-[1.1] mb-4 uppercase tracking-tighter group-hover:text-[#00A991] transition-colors">
                    {it.title}
                  </h3>
                  <p className="text-[12px] text-gray-400 font-medium leading-relaxed line-clamp-3">
                    {it.excerpt}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-[#0D2323]">
                    <Clock size={14} className="text-[#00A991]" />
                    <span className="text-[10px] font-black tracking-widest uppercase">{it.isOnline ? "ONLINE" : "IN PERSON"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#0D2323]">
                    <MapPin size={14} className="text-[#00A991]" />
                    <span className="text-[10px] font-black tracking-widest uppercase">{it.location}</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                   <button onClick={() => handleEdit(it)} className="text-[10px] font-black tracking-[0.3em] uppercase text-[#0D2323] border-b-2 border-[#00A991] pb-1">
                     Edit Event
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
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Location</label>
                  <input name="location" required className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Short Description</label>
                <textarea name="excerpt" rows={2} className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-medium leading-relaxed outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Full Description</label>
                <textarea name="description" rows={4} className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-medium leading-relaxed outline-none" />
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <input id="isOnlineCreate" name="isOnline" type="checkbox" />
                <label htmlFor="isOnlineCreate">Online Event</label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Badge Label</label>
                  <input name="badgeLabel" placeholder="EVENT" className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none uppercase tracking-widest" />
                </div>
                <label className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <input id="isFeatured" name="isFeatured" type="checkbox" />
                  Featured Event
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Cover Image</label>
                <input type="file" name="coverImage" accept="image/*" className="w-full bg-[#F9F9F9] p-2" />
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-6 items-center">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.3em] text-gray-400">DISCARD</button>
                <button type="submit" className="bg-[#00A991] text-white px-10 py-4 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-[#0D2323] transition-all">
                  Confirm Event
                </button>
              </div>
            </form>
          </Modal>

          {/* EDIT MODAL */}
          <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditItem(null); }} title="EDIT EVENT">
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(e.currentTarget); }} className="space-y-8 p-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Event Title</label>
                  <input name="name" defaultValue={editItem?.title || ""} required className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none uppercase tracking-widest" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Date</label>
                  <input type="date" name="date" defaultValue={editItem?.eventDate ? new Date(editItem.eventDate).toISOString().slice(0, 10) : ""} required className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Location</label>
                  <input name="location" defaultValue={editItem?.location || ""} className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Short Description</label>
                <textarea name="excerpt" defaultValue={editItem?.excerpt || ""} rows={2} className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-medium leading-relaxed outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Full Description</label>
                <textarea name="description" defaultValue={editItem?.content || ""} rows={4} className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-medium leading-relaxed outline-none" />
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <input id="isOnline" name="isOnline" type="checkbox" defaultChecked={Boolean(editItem?.isOnline)} />
                <label htmlFor="isOnline">Online Event</label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Badge Label</label>
                  <input name="badgeLabel" defaultValue={editItem?.badgeLabel || ""} placeholder="EVENT" className="w-full bg-[#F9F9F9] border-2 border-transparent focus:border-[#0D2323] p-4 text-xs font-bold outline-none uppercase tracking-widest" />
                </div>
                <label className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <input id="isFeaturedEdit" name="isFeatured" type="checkbox" defaultChecked={Boolean(editItem?.isFeatured)} />
                  Featured Event
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.3em] text-[#0D2323] uppercase">Cover Image</label>
                <input type="file" name="coverImage" accept="image/*" className="w-full bg-[#F9F9F9] p-2" />
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-6 items-center">
                <button type="button" onClick={() => { setEditOpen(false); setEditItem(null); }} className="text-[10px] font-black tracking-[0.3em] text-gray-400">DISCARD</button>
                <button type="submit" className="bg-[#00A991] text-white px-10 py-4 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-[#0D2323] transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  );
}
