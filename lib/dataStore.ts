type StoredFile = { name: string; size: number; type: string };

type Item = {
  id: string;
  type: string;
  title?: string;
  name?: string;
  date?: string;
  content?: string;
  description?: string;
  files?: StoredFile[];
  createdAt: number;
};

const store: Record<string, Item[]> = {
  news: [],
  events: [],
  gallery: [],
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const DataStore = {
  add(type: string, data: Partial<Item>) {
    const id = genId();
    const item: Item = {
      id,
      type,
      title: (data as any).title ?? (data as any).name ?? (data as any).title,
      name: (data as any).name,
      date: (data as any).date,
      content: (data as any).content,
      description: (data as any).description,
      files: (data as any).files ?? [],
      createdAt: Date.now(),
    };
    if (!store[type]) store[type] = [];
    store[type].unshift(item);
    return item;
  },
  list(type?: string) {
    if (!type) return store;
    return store[type] ?? [];
  },
  remove(type: string, id: string) {
    const arr = store[type];
    if (!arr) return false;
    const idx = arr.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    return true;
  },
};

export default DataStore;
