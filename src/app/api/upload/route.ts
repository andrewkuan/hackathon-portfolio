import { NextRequest, NextResponse } from "next/server";
import { saveFile, isAllowedMime } from "@/lib/storage";
import { verifyJwt } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!isAllowedMime(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const url = await saveFile(Buffer.from(arrayBuffer), file.type);
  return NextResponse.json({ url });
}
