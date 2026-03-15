import { NextResponse } from "next/server";
import { deleteUpload } from "../../../../lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
    const removed = deleteUpload(id as string);
    if (!removed) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, removed });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
