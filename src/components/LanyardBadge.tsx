"use client";

import dynamic from "next/dynamic";

const LanyardScene = dynamic(() => import("@/components/LanyardScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-neutral-600">
      loading 3D badge…
    </div>
  ),
});

export default function LanyardBadge() {
  return (
    <div className="relative h-full w-full">
      <LanyardScene />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-neutral-600">
        drag the badge
      </p>
    </div>
  );
}
