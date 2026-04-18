import { NextRequest, NextResponse } from "next/server";
import { readParticipants, upsert, newId } from "@/lib/db";
import { verifyJwt } from "@/lib/auth";
import type { Participant } from "@/lib/db";

export async function GET() {
  try {
    const participants = await readParticipants();
    return NextResponse.json(participants);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyJwt(token);
  } catch (e) {
    return NextResponse.json({ error: `Auth failed: ${String(e)}` }, { status: 401 });
  }

  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const participant: Participant = {
      id: newId(),
      name: body.name ?? "",
      linkedinUrl: body.linkedinUrl ?? "",
      instagramUrl: body.instagramUrl ?? "",
      photoUrl: body.photoUrl ?? "",
      photoSource: body.photoSource ?? "none",
      websiteUrl: body.websiteUrl ?? "",
      createdAt: now,
      updatedAt: now,
    };
    await upsert(participant);
    return NextResponse.json(participant, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
