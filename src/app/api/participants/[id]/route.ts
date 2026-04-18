import { NextRequest, NextResponse } from "next/server";
import { findById, upsert, remove } from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

async function requireAuth(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return "No token";
  try {
    await verifyJwt(token);
    return null;
  } catch (e) {
    return String(e);
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const participant = await findById(params.id);
    if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(participant);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authErr = await requireAuth(req);
  if (authErr) return NextResponse.json({ error: `Unauthorized: ${authErr}` }, { status: 401 });

  try {
    const existing = await findById(params.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updated = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await upsert(updated);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authErr = await requireAuth(req);
  if (authErr) return NextResponse.json({ error: `Unauthorized: ${authErr}` }, { status: 401 });

  try {
    await remove(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
