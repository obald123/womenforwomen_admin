"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Search, Pencil } from "lucide-react";
import Modal from "../components/Modal";
import ArticleEditor from "../components/ArticleEditor";
import { apiFetch, formatApiError, resolveAssetUrl } from "../../../lib/apiClient";
import { toast } from "react-toastify";

function stripHtml(html: string) {
  return html
    .replace(/<\/(p|div|h2|h3|li|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [createContent, setCreateContent] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");

  function fetchItems() {
    apiFetch<any>("/api/articles")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAdd(form: HTMLFormElement) {
    const fd = new FormData(form);
    const title = String(fd.get("title") || "");
    const content = createContent;
    const category = String(fd.get("category") || "NEWS");
    const publishDate = String(fd.get("publishDate") || "");
    if (content.length < 20) {
      toast.error("Content must be at least 20 characters");
      return;
    }
    const payload = new FormData();
    payload.append("title", title);
    payload.append("content", content);
    payload.append("excerpt", stripHtml(content).slice(0, 140));
    payload.append("category", category);
    payload.append("status", "PUBLISHED");
    if (publishDate) payload.append("publishedAt", new Date(publishDate).toISOString());
    const cover = fd.get("coverImage");
    if (cover instanceof File && cover.size > 0) payload.append("coverImage", cover);

    apiFetch("/api/articles", { method: "POST", body: payload })
      .then(() => {
        setOpen(false);
        setCreateContent("");
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
    apiFetch(`/api/articles/${deleteItem.id}`, { method: "DELETE" })
      .then(() => {
        setDeleteOpen(false);
        setDeleteItem(null);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function handleEdit(item: any) {
    setEditItem(item);
    setEditContent(String(item?.content || ""));
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
    const content = editContent;
    const category = String(fd.get("category") || editItem.category || "NEWS");
    const publishDate = String(fd.get("publishDate") || "");
    if (content.length < 20) {
      toast.error("Content must be at least 20 characters");
      return;
    }
    const payload = new FormData();
    payload.append("title", title);
    payload.append("content", content);
    payload.append("excerpt", stripHtml(content).slice(0, 140));
    payload.append("category", category);
    payload.append("status", editItem.status || "PUBLISHED");
    if (publishDate) payload.append("publishedAt", new Date(publishDate).toISOString());
    const cover = fd.get("coverImage");
    if (cover instanceof File && cover.size > 0) payload.append("coverImage", cover);

    apiFetch(`/api/articles/${editItem.id}`, { method: "PATCH", body: payload })
      .then(() => {
        setEditOpen(false);
        setEditItem(null);
        setEditContent("");
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
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
                          <button onClick={() => handleEdit(it)} className="text-gray-300 hover:text-[#0D2323] transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleView(it)} className="text-gray-300 hover:text-[#0D2323] transition-colors">
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(it)}
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
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Category</label>
                <select
                  name="category"
                  defaultValue="NEWS"
                  className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest bg-white"
                >
                  <option value="NEWS">NEWS</option>
                  <option value="STORY">STORY (Success Story)</option>
                  <option value="PRESS">PRESS</option>
                  <option value="BLOG">BLOG</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Publish Date</label>
                <input
                  type="date"
                  name="publishDate"
                  className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Article Content</label>
                <ArticleEditor value={createContent} onChange={setCreateContent} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Cover Image</label>
                <input name="coverImage" type="file" accept="image/*" className="w-full" />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">PUBLISH</button>
              </div>
            </form>
          </Modal>

          {/* EDIT MODAL */}
          <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditItem(null); }} title="EDIT ARTICLE">
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Headline</label>
                <input name="title" defaultValue={editItem?.title || ""} required className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Category</label>
                <select
                  name="category"
                  defaultValue={editItem?.category || "NEWS"}
                  className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest bg-white"
                >
                  <option value="NEWS">NEWS</option>
                  <option value="STORY">STORY (Success Story)</option>
                  <option value="PRESS">PRESS</option>
                  <option value="BLOG">BLOG</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Publish Date</label>
                <input
                  type="date"
                  name="publishDate"
                  defaultValue={editItem?.publishedAt ? new Date(editItem.publishedAt).toISOString().slice(0, 10) : ""}
                  className="w-full border-2 border-[#F2F2F2] focus:border-[#0D2323] px-4 py-3 text-xs font-bold outline-none transition-all uppercase tracking-widest bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Article Content</label>
                <ArticleEditor value={editContent} onChange={setEditContent} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Cover Image</label>
                <input name="coverImage" type="file" accept="image/*" className="w-full" />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => { setEditOpen(false); setEditItem(null); }} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">SAVE CHANGES</button>
              </div>
            </form>
          </Modal>

          {/* VIEW MODAL */}
          <Modal open={viewOpen} onClose={() => { setViewOpen(false); setViewItem(null); }} title="ARTICLE DETAILS">
            {viewItem && (
              <div className="space-y-4">
                {viewItem.coverImage && (
                  <div className="overflow-hidden rounded-md border border-[#F2F2F2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveAssetUrl(viewItem.coverImage)}
                      alt={viewItem.title}
                      className="w-full max-h-[320px] object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Title</div>
                  <div className="mt-2 text-sm font-bold uppercase text-[#0D2323]">{viewItem.title}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Excerpt</div>
                  <div className="mt-2 text-sm text-[#0D2323]">{viewItem.excerpt}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Content</div>
                  <div
                    className="mt-2 text-sm text-[#0D2323] [&_p]:mb-4 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:mb-4 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1 [&_a]:text-[#007A71] [&_a]:underline [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic [&_u]:underline [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-[#E7EEED]"
                    dangerouslySetInnerHTML={{ __html: String(viewItem.content || "") }}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => { setViewOpen(false); setViewItem(null); }} className="bg-[#0D2323] text-white px-6 py-2 text-[10px] font-black tracking-[0.2em] hover:bg-[#00A991] transition-all">
                    CLOSE
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* DELETE CONFIRMATION */}
          <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteItem(null); }} title="DELETE ARTICLE">
            <div className="space-y-4">
              <p className="text-sm text-[#0D2323]">
                Are you sure you want to delete this article?
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
