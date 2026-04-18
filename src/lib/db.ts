import crypto from "crypto";

export interface Participant {
  id: string;
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  photoUrl: string;
  photoSource: "linkedin" | "upload" | "none";
  createdAt: string;
  updatedAt: string;
}

const KV_KEY = "participants";

function isKvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ── Vercel KV path ──────────────────────────────────────────────────────────

async function kvRead(): Promise<Participant[]> {
  const { kv } = await import("@vercel/kv");
  const data = await kv.get<Participant[]>(KV_KEY);
  return data ?? [];
}

async function kvWrite(data: Participant[]): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, data);
}

// ── Local JSON file path ─────────────────────────────────────────────────────

async function fileRead(): Promise<Participant[]> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "participants.json");
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as Participant[];
  } catch {
    return [];
  }
}

let writeChain: Promise<void> = Promise.resolve();

async function fileWrite(data: Participant[]): Promise<void> {
  writeChain = writeChain.then(async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "participants.json");
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  });
  return writeChain;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function readParticipants(): Promise<Participant[]> {
  return isKvEnabled() ? kvRead() : fileRead();
}

export async function writeParticipants(data: Participant[]): Promise<void> {
  return isKvEnabled() ? kvWrite(data) : fileWrite(data);
}

export async function findById(id: string): Promise<Participant | undefined> {
  const all = await readParticipants();
  return all.find((p) => p.id === id);
}

export async function upsert(participant: Participant): Promise<void> {
  const all = await readParticipants();
  const idx = all.findIndex((p) => p.id === participant.id);
  if (idx >= 0) {
    all[idx] = participant;
  } else {
    all.push(participant);
  }
  await writeParticipants(all);
}

export async function remove(id: string): Promise<void> {
  const all = await readParticipants();
  await writeParticipants(all.filter((p) => p.id !== id));
}

export function newId(): string {
  return crypto.randomUUID();
}
