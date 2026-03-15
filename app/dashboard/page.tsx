import Link from "next/link";
import DataStore from "../../lib/dataStore";

export default function Page() {
  const store = DataStore.list() as Record<string, any[]>;
  const news = Array.isArray(store.news) ? store.news : [];
  const events = Array.isArray(store.events) ? store.events : [];
  const gallery = Array.isArray(store.gallery) ? store.gallery : [];
  const team = Array.isArray(store.team) ? store.team : [];
  const subscribers = Array.isArray(store.subscribers) ? store.subscribers : [];

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#00A991]" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#00A991] uppercase">Overview</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D2323] uppercase">Dashboard Overview</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/news" className="px-4 py-2 bg-white border border-[#F2F2F2]">News</Link>
              <Link href="/dashboard/team" className="px-4 py-2 bg-white border border-[#F2F2F2]">Team</Link>
              <Link href="/dashboard/newsletter" className="px-4 py-2 bg-[#0D2323] text-white">Newsletter</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-[#F2F2F2] p-6">
              <div className="text-sm font-black text-gray-400 uppercase">Articles</div>
              <div className="mt-4 text-3xl font-black">{news.length}</div>
              <div className="mt-4">
                <Link href="/dashboard/news" className="text-[11px] font-bold text-[#00A991]">Manage articles</Link>
              </div>
            </div>

            <div className="bg-white border border-[#F2F2F2] p-6">
              <div className="text-sm font-black text-gray-400 uppercase">Events</div>
              <div className="mt-4 text-3xl font-black">{events.length}</div>
              <div className="mt-4">
                <Link href="/dashboard/events" className="text-[11px] font-bold text-[#00A991]">Manage events</Link>
              </div>
            </div>

            <div className="bg-white border border-[#F2F2F2] p-6">
              <div className="text-sm font-black text-gray-400 uppercase">Gallery</div>
              <div className="mt-4 text-3xl font-black">{gallery.length}</div>
              <div className="mt-4">
                <Link href="/dashboard/gallery" className="text-[11px] font-bold text-[#00A991]">Manage gallery</Link>
              </div>
            </div>

            <div className="bg-white border border-[#F2F2F2] p-6">
              <div className="text-sm font-black text-gray-400 uppercase">Team</div>
              <div className="mt-4 text-3xl font-black">{team.length}</div>
              <div className="mt-4">
                <Link href="/dashboard/team" className="text-[11px] font-bold text-[#00A991]">Manage team</Link>
              </div>
            </div>

            <div className="bg-white border border-[#F2F2F2] p-6">
              <div className="text-sm font-black text-gray-400 uppercase">Subscribers</div>
              <div className="mt-4 text-3xl font-black">{subscribers.length}</div>
              <div className="mt-4">
                <Link href="/dashboard/newsletter" className="text-[11px] font-bold text-[#00A991]">Manage subscribers</Link>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#F2F2F2] p-6">
            <h2 className="text-[13px] font-black uppercase">Recent Articles</h2>
            <ul className="mt-4 space-y-3">
              {news.length === 0 && (
                <li className="text-gray-300">No articles yet</li>
              )}
              {news.slice(0, 6).map((n: any) => (
                <li key={n.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-black">{n.title || "Untitled"}</div>
                    <div className="text-[11px] text-gray-400">{n.content ? String(n.content).substring(0, 80) + '...' : ''}</div>
                  </div>
                  <div className="text-[11px] text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}
