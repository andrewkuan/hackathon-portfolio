import { readParticipants } from "@/lib/db";
import { ParticipantCard } from "@/components/ParticipantCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const participants = await readParticipants();

  return (
    <main className="min-h-screen" style={{ background: "var(--cream)" }}>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-12">

        {/* dotted border frame */}
        <div
          className="absolute inset-6 rounded-3xl pointer-events-none"
          style={{ border: "2px dashed var(--tan)", opacity: 0.5 }}
        />

        {/* arched title */}
        <div className="relative z-10 flex flex-col items-center gap-2 mb-8">
          <svg viewBox="0 0 420 80" className="w-[320px] sm:w-[420px]" aria-hidden>
            <defs>
              <path id="arc" d="M 30,70 A 200,200 0 0,1 390,70" />
            </defs>
            <text
              fontFamily="Arial, sans-serif"
              fontWeight="900"
              fontSize="38"
              letterSpacing="6"
              fill="var(--navy)"
              textAnchor="middle"
            >
              <textPath href="#arc" startOffset="50%">
                THE LIVING ROOM LAB
              </textPath>
            </text>
          </svg>

          {/* couch illustration */}
          <div className="text-7xl my-1 select-none">🛋️</div>

          <p
            className="text-3xl sm:text-4xl font-black tracking-widest uppercase mt-1"
            style={{ color: "var(--navy)" }}
          >
            AI Hackathon
          </p>
          <p className="text-sm tracking-widest uppercase mt-2" style={{ color: "var(--brown)" }}>
            {participants.length} Builder{participants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* divider */}
        <div className="w-24 h-px mb-10" style={{ background: "var(--tan)" }} />

        {/* ── Participant Grid ── */}
        {participants.length === 0 ? (
          <p className="text-center mt-10 tracking-wide" style={{ color: "var(--brown)" }}>
            No participants yet — check back soon.
          </p>
        ) : (
          <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
            {participants.map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs tracking-widest uppercase" style={{ color: "var(--tan)" }}>
        The Living Room Lab · AI Hackathon
      </footer>
    </main>
  );
}
