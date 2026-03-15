import { NextResponse } from "next/server";
import DataStore from "../../../lib/dataStore";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || undefined;
  const items = DataStore.list(type as any);
  return NextResponse.json({ success: true, items });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const type = (formData.get("type") as string) || "unknown";
  const entry: Record<string, any> = { type };

  for (const [key, val] of formData.entries()) {
    if (val instanceof File) {
      if (!entry.files) entry.files = [];
      entry.files.push({ name: val.name, size: val.size, type: val.type });
    } else {
      entry[key] = val;
    }
  }

  const created = DataStore.add(type, entry as any);
  return NextResponse.json({ success: true, entry: created });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "";
  const id = url.searchParams.get("id") || "";
  if (!type || !id) {
    return NextResponse.json({ success: false, error: "missing type or id" }, { status: 400 });
  }
  const ok = DataStore.remove(type, id);
  return NextResponse.json({ success: ok });
}
