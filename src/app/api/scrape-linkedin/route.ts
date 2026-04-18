import { NextRequest, NextResponse } from "next/server";
import { fetchLinkedInOgImage } from "@/lib/scrape";
import { verifyJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { linkedinUrl } = await req.json();
  if (!linkedinUrl) {
    return NextResponse.json({ error: "linkedinUrl required" }, { status: 400 });
  }

  const imageUrl = await fetchLinkedInOgImage(linkedinUrl);
  return NextResponse.json({ imageUrl, scraped: imageUrl !== null });
}
