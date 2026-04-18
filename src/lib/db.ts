import crypto from "crypto";
import path from "path";

export interface Participant {
  id: string;
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  photoUrl: string;
  photoSource: "linkedin" | "upload" | "none";
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
}

const KV_KEY = "participants";

function isKvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ── Upstash Redis path ───────────────────────────────────────────────────────

async function kvRead(): Promise<Participant[]> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  const data = await redis.get<Participant[]>(KV_KEY);
  return data ?? [];
}

async function kvWrite(data: Participant[]): Promise<void> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  await redis.set(KV_KEY, data);
}

// ── Local JSON file path ─────────────────────────────────────────────────────

function jsonFilePath(): string {
  if (process.env.VERCEL) return "/tmp/participants.json";
  return path.join(process.cwd(), "data", "participants.json");
}

async function fileRead(): Promise<Participant[]> {
  const fs = await import("fs/promises");
  try {
    const raw = await fs.readFile(jsonFilePath(), "utf-8");
    return JSON.parse(raw) as Participant[];
  } catch {
    return [];
  }
}

let writeChain: Promise<void> = Promise.resolve();

async function fileWrite(data: Participant[]): Promise<void> {
  writeChain = writeChain.then(async () => {
    const fs = await import("fs/promises");
    await fs.writeFile(jsonFilePath(), JSON.stringify(data, null, 2), "utf-8");
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
