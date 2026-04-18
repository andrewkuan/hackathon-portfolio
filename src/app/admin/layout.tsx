"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            ← Public Site
          </Link>
          <Link href="/admin/participants" className="text-sm font-medium text-gray-800 hover:text-blue-600">
            Participants
          </Link>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
