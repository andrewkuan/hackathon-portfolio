"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeleting(true);
    await fetch(`/api/participants/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {deleting ? "…" : "Delete"}
    </button>
  );
}
