"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Pencil, Download } from "lucide-react";
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

  function fetchItems() {
    apiFetch<any>("/api/impact-reports?pageSize=100")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = data.sort((a: any, b: any) => {
          const ao = typeof a.displayOrder === "number" ? a.displayOrder : 0;
          const bo = typeof b.displayOrder === "number" ? b.displayOrder : 0;
          if (ao !== bo) return ao - bo;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setItems(sorted);
      })
      .catch(() => setItems([]));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    fd.append("status", "PUBLISHED");
    const year = String(fd.get("year") || "").trim();
    if (!year) fd.delete("year");
    const coverImage = fd.get("coverImage");
    if (!(coverImage instanceof File) || coverImage.size === 0) fd.delete("coverImage");

    apiFetch("/api/impact-reports", { method: "POST", body: fd })
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
    apiFetch(`/api/impact-reports/${deleteItem.id}`, { method: "DELETE" })
      .then(() => {
        setDeleteOpen(false);
        setDeleteItem(null);
        setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function handleEdit(item: any) {
    setEditItem(item);
    setEditOpen(true);
  }

  function handleUpdate(form: HTMLFormElement) {
    if (!editItem) return;
    const fd = new FormData(form);
    fd.append("status", editItem.status || "PUBLISHED");
    const year = String(fd.get("year") || "").trim();
    if (!year) fd.delete("year");
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) fd.delete("file");
    const coverImage = fd.get("coverImage");
    if (!(coverImage instanceof File) || coverImage.size === 0) fd.delete("coverImage");

    apiFetch(`/api/impact-reports/${editItem.id}`, { method: "PATCH", body: fd })
      .then(() => {
        setEditOpen(false);
        setEditItem(null);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const current = items[index];
    const target = items[nextIndex];
    const currentOrder = typeof current.displayOrder === "number" ? current.displayOrder : index;
    const targetOrder = typeof target.displayOrder === "number" ? target.displayOrder : nextIndex;
    const isSameOrder = currentOrder === targetOrder;
    const swapA = isSameOrder ? nextIndex : targetOrder;
    const swapB = isSameOrder ? index : currentOrder;

    Promise.all([
      apiFetch(`/api/impact-reports/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ displayOrder: swapA }),
      }),
      apiFetch(`/api/impact-reports/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify({ displayOrder: swapB }),
      }),
    ])
      .then(() => fetchItems())
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
                <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Impact</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D2323] uppercase">Impact Reports</h1>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 bg-[#0D2323] text-white px-8 py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all hover:bg-[#00A991]"
            >
              <Plus size={16} strokeWidth={3} />
              Add Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 && (
              <div className="col-span-full p-12 bg-white border border-[#F2F2F2] text-center text-gray-300">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase">No impact reports yet</p>
              </div>
            )}

            {items.map((it, index) => (
              <div key={it.id} className="bg-white border border-[#F2F2F2] p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center shrink-0">
                    {it.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveAssetUrl(it.coverImage)} alt={it.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-black uppercase truncate">{it.title}</h3>
                    {it.year && <p className="text-[11px] font-bold text-gray-400 mt-1">{it.year}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="text-[10px] font-black text-[#0D2323] disabled:text-gray-300"
                        title="Move up"
                      >
                        UP
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        className="text-[10px] font-black text-[#0D2323] disabled:text-gray-300"
                        title="Move down"
                      >
                        DOWN
                      </button>
                    </div>
                    <button onClick={() => handleEdit(it)} className="text-gray-300 hover:text-[#0D2323]">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteRequest(it)} className="text-gray-300 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {it.description && <p className="text-[11px] text-gray-700 mb-3">{it.description}</p>}
                {it.fileUrl && (
                  <a
                    href={resolveAssetUrl(`/api/public/impact-reports/${it.id}/download`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.15em] uppercase text-[#00A991] hover:text-[#0D2323]"
                  >
                    <Download size={12} />
                    {it.fileName || "View file"}
                  </a>
                )}
              </div>
            ))}
          </div>

          <Modal open={open} onClose={() => setOpen(false)} title="Add Impact Report">
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Title</label>
                <input name="title" required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Year</label>
                <input name="year" type="number" min="1990" max="2100" className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Description</label>
                <textarea name="description" rows={3} className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-medium outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Report File (PDF/DOC)</label>
                <input type="file" name="file" accept=".pdf,.doc,.docx" required className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Cover Image (optional)</label>
                <input type="file" name="coverImage" accept="image/*" className="w-full" />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">ADD REPORT</button>
              </div>
            </form>
          </Modal>

          <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditItem(null); }} title="Edit Impact Report">
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Title</label>
                <input name="title" defaultValue={editItem?.title || ""} required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Year</label>
                <input name="year" type="number" min="1990" max="2100" defaultValue={editItem?.year || ""} className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Description</label>
                <textarea name="description" defaultValue={editItem?.description || ""} rows={3} className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-medium outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Report File (leave blank to keep current)
                </label>
                {editItem?.fileName && (
                  <p className="text-[11px] text-gray-500">Current: {editItem.fileName}</p>
                )}
                <input type="file" name="file" accept=".pdf,.doc,.docx" className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Cover Image (leave blank to keep current)</label>
                <input type="file" name="coverImage" accept="image/*" className="w-full" />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => { setEditOpen(false); setEditItem(null); }} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">SAVE CHANGES</button>
              </div>
            </form>
          </Modal>

          <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteItem(null); }} title="DELETE IMPACT REPORT">
            <div className="space-y-4">
              <p className="text-sm text-[#0D2323]">
                Are you sure you want to delete this impact report?
              </p>
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

        </div>
      </main>
    </div>
  );
}
