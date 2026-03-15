"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Pencil } from "lucide-react";
import Modal from "../components/Modal";
import { apiFetch, formatApiError, resolveAssetUrl } from "../../../lib/apiClient";
import { toast } from "react-toastify";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  function fetchItems() {
    apiFetch<any>("/api/team")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    fd.append("category", "STAFF");
    fd.append("status", "PUBLISHED");

    apiFetch("/api/team", { method: "POST", body: fd })
      .then(() => {
        setOpen(false);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function handleDelete(id: string) {
    if (confirm("Remove team member?")) {
      apiFetch(`/api/team/${id}`, { method: "DELETE" })
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
    fd.append("category", editItem.category || "STAFF");
    fd.append("status", editItem.status || "PUBLISHED");
    const photo = fd.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      fd.delete("photo");
    }

    apiFetch(`/api/team/${editItem.id}`, { method: "PATCH", body: fd })
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

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#00A991]" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Team</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D2323] uppercase">Team Members</h1>
            </div>

            <button 
              onClick={() => setOpen(true)} 
              className="flex items-center gap-3 bg-[#0D2323] text-white px-8 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all hover:bg-[#00A991]"
            >
              <Plus size={16} strokeWidth={3} />
              Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 && (
              <div className="col-span-full p-12 bg-white border border-[#F2F2F2] text-center text-gray-300">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase">No team members yet</p>
              </div>
            )}

            {items.map((it) => (
              <div key={it.id} className="bg-white border border-[#F2F2F2] p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                    {it.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveAssetUrl(it.photo)} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={28} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-black uppercase">{it.name}</h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-1">{it.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(it)} className="text-gray-300 hover:text-[#0D2323]">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(it.id)} className="text-gray-300 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-700">{it.bio}</p>
              </div>
            ))}
          </div>

          <Modal open={open} onClose={() => setOpen(false)} title="Add Team Member">
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Full Name</label>
                <input name="name" required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Role</label>
                <input name="role" required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Bio</label>
                <textarea name="bio" rows={4} className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-medium outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Photo</label>
                <input type="file" name="photo" accept="image/*" className="w-full" />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">ADD MEMBER</button>
              </div>
            </form>
          </Modal>

          <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditItem(null); }} title="Edit Team Member">
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Full Name</label>
                <input name="name" defaultValue={editItem?.name || ""} required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Role</label>
                <input name="role" defaultValue={editItem?.role || ""} required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Bio</label>
                <textarea name="bio" defaultValue={editItem?.bio || ""} rows={4} className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-medium outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Photo</label>
                <input type="file" name="photo" accept="image/*" className="w-full" />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => { setEditOpen(false); setEditItem(null); }} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">SAVE CHANGES</button>
              </div>
            </form>
          </Modal>

        </div>
      </main>
    </div>
  );
}
