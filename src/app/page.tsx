import { readParticipants } from "@/lib/db";
import { ParticipantCard } from "@/components/ParticipantCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const participants = await readParticipants();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Hackathon Participants</h1>
        <p className="text-gray-500 text-center mb-10">
          {participants.length} participant{participants.length !== 1 ? "s" : ""}
        </p>

        {participants.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No participants yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {participants.map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
