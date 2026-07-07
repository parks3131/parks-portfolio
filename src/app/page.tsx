import LanyardBadge from "@/components/LanyardBadge";
import Terminal from "@/components/Terminal";
import { profile } from "@/lib/content";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-950">
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-cyan-400">{profile.name}</h1>
          <p className="text-sm text-neutral-500">{profile.title}</p>
        </div>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-500 hover:text-cyan-400 hover:underline"
        >
          GitHub ↗
        </a>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <div className="h-[360px] min-h-0 border-b border-neutral-800 md:h-full md:border-b-0 md:border-r">
          <LanyardBadge />
        </div>
        <div className="min-h-0 flex-1 md:h-full">
          <Terminal />
        </div>
      </main>
    </div>
  );
}
