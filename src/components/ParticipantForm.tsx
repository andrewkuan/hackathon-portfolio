"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUpload } from "./ImageUpload";
import type { Participant } from "@/lib/db";

interface Props {
  initial?: Partial<Participant>;
  mode: "create" | "edit";
}

export function ParticipantForm({ initial = {}, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl ?? "");
  const [photoSource, setPhotoSource] = useState<"linkedin" | "upload" | "none">(
    initial.photoSource ?? "none"
  );
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchLinkedInPhoto() {
    if (!linkedinUrl) return;
    setScraping(true);
    setScrapeMsg(null);
    try {
      const res = await fetch("/api/scrape-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl }),
      });
      let data = { scraped: false, imageUrl: null };
      try { data = await res.json(); } catch {}
      if (data.scraped && data.imageUrl) {
        setPhotoUrl(data.imageUrl);
        setPhotoSource("linkedin");
        setScrapeMsg("Photo fetched from LinkedIn.");
      } else {
        setScrapeMsg("Could not fetch photo — please upload manually.");
      }
    } catch {
      setScrapeMsg("Error fetching photo.");
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = { name, linkedinUrl, instagramUrl, photoUrl, photoSource };
    const url = mode === "edit" ? `/api/participants/${initial.id}` : "/api/participants";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = "Save failed";
        try { msg = (await res.json()).error ?? msg; } catch {}
        throw new Error(msg);
      }
      router.push("/admin/participants");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/handle"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={fetchLinkedInPhoto}
            disabled={scraping || !linkedinUrl}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {scraping ? "Fetching…" : "Fetch Photo"}
          </button>
        </div>
        {scrapeMsg && (
          <p className={`text-sm mt-1 ${scrapeMsg.includes("fetched") ? "text-green-600" : "text-amber-600"}`}>
            {scrapeMsg}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/handle"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
        {photoUrl && photoSource === "linkedin" && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image src={photoUrl} alt="LinkedIn photo" fill className="object-cover" unoptimized />
            </div>
            <div>
              <p className="text-sm text-green-600">Using LinkedIn photo</p>
              <button
                type="button"
                onClick={() => { setPhotoUrl(""); setPhotoSource("none"); }}
                className="text-xs text-gray-500 underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        <ImageUpload
          currentUrl={photoSource === "upload" ? photoUrl : undefined}
          onUploaded={(url) => { setPhotoUrl(url); setPhotoSource("upload"); }}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Add Participant"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/participants")}
          className="px-5 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
