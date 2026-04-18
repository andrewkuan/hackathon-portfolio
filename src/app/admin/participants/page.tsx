import Link from "next/link";
import { readParticipants } from "@/lib/db";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const participants = await readParticipants();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Participants ({participants.length})</h1>
        <Link
          href="/admin/participants/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Participant
        </Link>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 text-center py-20">No participants yet. Add one!</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">LinkedIn</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Instagram</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.linkedinUrl ? (
                      <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs block">
                        {p.linkedinUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.instagramUrl ? (
                      <a href={p.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline truncate max-w-xs block">
                        {p.instagramUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <Link
                        href={`/admin/participants/${p.id}/edit`}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
