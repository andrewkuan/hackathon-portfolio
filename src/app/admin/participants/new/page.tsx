import { ParticipantForm } from "@/components/ParticipantForm";

export default function NewParticipantPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Participant</h1>
      <ParticipantForm mode="create" />
    </div>
  );
}
