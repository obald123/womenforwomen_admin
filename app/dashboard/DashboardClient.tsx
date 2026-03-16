"use client";
import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function DashboardClient() {
  const [section, setSection] = useState<"news" | "events" | "gallery">("news");
  const [message, setMessage] = useState<string>("");

  async function submitForm(form: HTMLFormElement, type: string) {
    const fd = new FormData(form);
    fd.append("type", type);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setMessage(`Success: ${JSON.stringify(data)}`);
      form.reset();
    } catch (err) {
      setMessage("Upload failed");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {section === "news" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Upload News / Article</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm(e.currentTarget, "news");
                }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input name="title" required className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Content</label>
                  <textarea name="content" required className="mt-1 w-full border rounded px-3 py-2" rows={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Image</label>
                  <input type="file" name="image" accept="image/*" className="mt-1" />
                </div>
                <div>
                  <button type="submit" className="rounded bg-black text-white px-4 py-2">
                    Upload
                  </button>
                </div>
              </form>
            </section>
          )}

          {section === "events" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Upload Event</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm(e.currentTarget, "event");
                }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Event Name</label>
                  <input name="name" required className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Date</label>
                  <input type="date" name="date" className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea name="description" className="mt-1 w-full border rounded px-3 py-2" rows={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Image</label>
                  <input type="file" name="image" accept="image/*" className="mt-1" />
                </div>
                <div>
                  <button type="submit" className="rounded bg-black text-white px-4 py-2">
                    Upload Event
                  </button>
                </div>
              </form>
            </section>
          )}

          {section === "gallery" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Upload Gallery Images</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm(e.currentTarget, "gallery");
                }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input name="title" className="mt-1 w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Images</label>
                  <input type="file" name="images" accept="image/*" multiple className="mt-1" />
                </div>
                <div>
                  <button type="submit" className="rounded bg-black text-white px-4 py-2">
                    Upload Gallery
                  </button>
                </div>
              </form>
            </section>
          )}

          {message && <div className="mt-6 text-sm text-green-600">{message}</div>}
        </main>
      </div>
    </div>
  );
}
