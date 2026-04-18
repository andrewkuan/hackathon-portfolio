import { NextRequest, NextResponse } from "next/server";
import { findById, upsert, remove } from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

async function requireAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;
  try {
    await verifyJwt(token);
    return true;
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const participant = await findById(params.id);
  if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(participant);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await remove(params.id);
  return NextResponse.json({ ok: true });
}
