"use client";

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { apiFetch, formatApiError } from "../../../lib/apiClient";
import { toast } from "react-toastify";
import Modal from "../components/Modal";

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function MessagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function fetchItems() {
    apiFetch<any>("/api/messages")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleSelect(item: any) {
    setSelected(item);
    if (!item.isRead) {
      apiFetch(`/api/messages/${item.id}`, { method: "PATCH", body: JSON.stringify({ isRead: true }) })
        .then(() => fetchItems())
        .catch(() => undefined);
    }
  }

  function handleDeleteConfirm() {
    if (!selected) return;
    apiFetch(`/api/messages/${selected.id}`, { method: "DELETE" })
      .then(() => {
        setDeleteOpen(false);
        setSelected(null);
        fetchItems();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[2px] bg-[#00A991]" />
            <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Messages</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
            <div className="bg-white border border-[#F2F2F2]">
              <div className="px-6 py-4 border-b border-[#F2F2F2] text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">
                Incoming Messages
              </div>
              {items.length === 0 ? (
                <div className="p-10 text-center text-gray-300 text-[10px] font-black tracking-[0.2em] uppercase">
                  No messages yet
                </div>
              ) : (
                <ul className="divide-y divide-[#F2F2F2]">
                  {items.map((item) => (
                    <li key={item.id} className="px-6 py-5 flex items-center justify-between hover:bg-[#FAFAFA] cursor-pointer" onClick={() => handleSelect(item)}>
                      <div className="flex items-center gap-4">
                        <div className={`h-2 w-2 rounded-full ${item.isRead ? "bg-gray-200" : "bg-[#00A991]"}`} />
                        <div>
                          <div className="text-[12px] font-black uppercase text-[#0D2323]">{item.name}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{item.email}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white border border-[#F2F2F2] p-6">
              {selected ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[12px] font-black uppercase">{selected.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{selected.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setDeleteOpen(true)} className="text-gray-300 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-[12px] text-[#0D2323]">
                    {selected.phone && (
                      <div><span className="font-bold">Phone:</span> {selected.phone}</div>
                    )}
                    {selected.organization && (
                      <div><span className="font-bold">Organization:</span> {selected.organization}</div>
                    )}
                    <div><span className="font-bold">Received:</span> {formatDate(selected.createdAt)}</div>
                  </div>

                  <div className="mt-6 border-t border-[#F2F2F2] pt-4 text-[13px] text-[#4E5B59] whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-gray-400">Select a message to view details.</div>
              )}
            </div>
          </div>

          <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="DELETE MESSAGE">
            <div className="space-y-4">
              <p className="text-sm text-[#0D2323]">Are you sure you want to delete this message?</p>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setDeleteOpen(false)} className="text-[10px] font-black tracking-[0.2em] text-gray-400">CANCEL</button>
                <button type="button" onClick={handleDeleteConfirm} className="bg-red-600 text-white px-8 py-3 text-[10px] font-black tracking-[0.2em] hover:bg-red-700 transition-all">DELETE</button>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
