"use client";
import React, { useEffect, useState } from "react";
import { Mail, Plus, Send, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import { apiFetch, formatApiError } from "../../../lib/apiClient";
import { toast } from "react-toastify";

export default function Page() {
  const [subs, setSubs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openCompose, setOpenCompose] = useState(false);

  function fetchSubs() {
    apiFetch<any>("/api/newsletter/subscribers")
      .then((res) => setSubs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSubs([]));
  }

  function fetchNews() {
    apiFetch<any>("/api/articles")
      .then((res) => setNews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNews([]));
  }

  useEffect(() => {
    fetchSubs();
    fetchNews();
  }, []);

  function addSubscriber(form: HTMLFormElement) {
    const fd = new FormData(form);
    const name = (fd.get("name") as string) || "";
    const email = (fd.get("email") as string) || "";
    if (!email) return toast.error("Please provide an email");

    apiFetch("/api/public/subscribe", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    })
      .then(() => {
        setOpenAdd(false);
        fetchSubs();
      })
      .catch((err) => toast.error(formatApiError(err)));
  }

  function removeSubscriber(id: string) {
    if (!confirm("Remove subscriber?")) return;
    apiFetch(`/api/newsletter/unsubscribe/${id}`, { method: "DELETE" })
      .then(() => fetchSubs())
      .catch((err) => toast.error(formatApiError(err)));
  }

  async function sendToSubscribers(subject: string, content: string) {
    const campaign = await apiFetch<any>("/api/newsletter/campaigns", {
      method: "POST",
      body: JSON.stringify({ subject, content }),
    });
    await apiFetch(`/api/newsletter/send/${campaign.data.id}`, { method: "POST" });
  }

  function sendNewsletter(form: HTMLFormElement) {
    const fd = new FormData(form);
    const subject = (fd.get("subject") as string) || "";
    const content = (fd.get("content") as string) || "";
    if (!subject || !content) return toast.error("Fill subject and body");

    sendToSubscribers(subject, content)
      .then(() => setOpenCompose(false))
      .catch((err) => toast.error(formatApiError(err)));
  }

  function sendArticle(articleId: string) {
    const article = news.find((n) => n.id === articleId);
    if (!article) return toast.error("Article not found");
    if (!confirm(`Send article "${article.title}" to all subscribers?`)) return;
    const subject = article.title || "News update";
    const content = article.content || article.excerpt || "";
    sendToSubscribers(subject, content).catch((err) => toast.error(formatApiError(err)));
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#00A991]" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Communications</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D2323] uppercase">Newsletter</h1>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setOpenAdd(true)} className="flex items-center gap-3 bg-white border border-[#F2F2F2] px-6 py-3 text-[11px] font-black">
                <Plus size={14} />
                Add Subscriber
              </button>
              <button onClick={() => setOpenCompose(true)} className="flex items-center gap-3 bg-[#0D2323] text-white px-6 py-3 text-[11px] font-black">
                <Send size={14} />
                Compose
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#F2F2F2] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-black uppercase">Articles</h2>
              <span className="text-[11px] font-bold text-gray-400">Total: {news.length}</span>
            </div>

            {news.length === 0 ? (
              <div className="py-12 text-center text-gray-300">No articles available</div>
            ) : (
              <ul className="divide-y divide-[#F2F2F2]">
                {news.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-[12px] font-black">{a.title || "Untitled"}</div>
                      <div className="text-[11px] text-gray-400">{String(a.content || a.excerpt || "").substring(0, 120)}...</div>
                    </div>
                    <div>
                      <button onClick={() => sendArticle(a.id)} className="bg-[#0D2323] text-white px-4 py-2 text-[11px] font-bold">Send</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-[#F2F2F2] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-black uppercase">Subscribers</h2>
              <span className="text-[11px] font-bold text-gray-400">Total: {subs.length}</span>
            </div>

            {subs.length === 0 ? (
              <div className="py-12 text-center text-gray-300">No subscribers yet</div>
            ) : (
              <ul className="divide-y divide-[#F2F2F2]">
                {subs.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-[12px] font-black">{s.name || s.email}</div>
                      <div className="text-[11px] text-gray-400">{s.email}</div>
                    </div>
                    <div>
                      <button onClick={() => removeSubscriber(s.id)} className="text-gray-300 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Subscriber">
            <form onSubmit={(e) => { e.preventDefault(); addSubscriber(e.currentTarget); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Name</label>
                <input name="name" className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Email</label>
                <input name="email" type="email" required className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold outline-none" />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpenAdd(false)} className="text-[10px] font-black text-gray-400">Cancel</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black">Add</button>
              </div>
            </form>
          </Modal>

          <Modal open={openCompose} onClose={() => setOpenCompose(false)} title="Compose Newsletter">
            <form onSubmit={(e) => { e.preventDefault(); sendNewsletter(e.currentTarget); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Subject</label>
                <input name="subject" required className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Message</label>
                <textarea name="content" rows={8} required className="w-full border-2 border-[#F2F2F2] px-4 py-3 text-xs font-medium outline-none" />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-[#F2F2F2]">
                <button type="button" onClick={() => setOpenCompose(false)} className="text-[10px] font-black text-gray-400">Cancel</button>
                <button type="submit" className="bg-[#0D2323] text-white px-8 py-3 text-[10px] font-black">Send to Subscribers</button>
              </div>
            </form>
          </Modal>

        </div>
      </main>
    </div>
  );
}