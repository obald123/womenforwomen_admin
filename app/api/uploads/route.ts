import { NextResponse } from "next/server";
import { getUploads } from "../../../../lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || undefined;
  const items = getUploads(type as string | undefined);
  return NextResponse.json({ success: true, items });
}
