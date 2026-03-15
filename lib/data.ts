export type UploadEntry = {
  id: string;
  type: string;
  title?: string;
  content?: string;
  name?: string;
  files?: { name: string; size: number; type: string }[];
  date?: string;
  description?: string;
  createdAt: number;
};

const uploads: UploadEntry[] = [];

export function addUpload(entry: Partial<UploadEntry>) {
  const newEntry: UploadEntry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type: entry.type || "unknown",
    title: entry.title,
    content: entry.content,
    name: entry.name,
    files: entry.files || [],
    date: entry.date,
    description: entry.description,
    createdAt: Date.now(),
  };
  uploads.unshift(newEntry);
  return newEntry;
}

export function getUploads(type?: string) {
  if (!type) return uploads;
  return uploads.filter((u) => u.type === type);
}

export function deleteUpload(id: string) {
  const idx = uploads.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const [removed] = uploads.splice(idx, 1);
  return removed;
}
