import { notFound } from "next/navigation";
import { findById } from "@/lib/db";
import { ParticipantForm } from "@/components/ParticipantForm";

export const dynamic = "force-dynamic";

export default async function EditParticipantPage({ params }: { params: { id: string } }) {
  const participant = await findById(params.id);
  if (!participant) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Participant</h1>
      <ParticipantForm mode="edit" initial={participant} />
    </div>
  );
}
