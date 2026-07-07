"use client";

import { useEffect, useRef, useState } from "react";
import type { OutputLine, Segment } from "@/lib/commands";

const CHAR_DELAY_MS = 10;
const LINE_PAUSE_MS = 45;

function renderSegmentSlice(seg: Segment, take: number, key: number) {
  const partial = seg.text.slice(0, take);
  if (!partial) return null;
  return seg.href ? (
    <a key={key} href={seg.href} target="_blank" rel="noreferrer" className={seg.className}>
      {partial}
    </a>
  ) : (
    <span key={key} className={seg.className}>
      {partial}
    </span>
  );
}

function sliceSegments(segments: Segment[], revealChars: number) {
  let remaining = revealChars;
  return segments.map((seg, i) => {
    if (remaining <= 0) return null;
    const take = Math.min(seg.text.length, remaining);
    remaining -= take;
    return renderSegmentSlice(seg, take, i);
  });
}

function LineView({ line, revealChars, caret }: { line: OutputLine; revealChars: number; caret?: boolean }) {
  const parts = sliceSegments(line.segments, revealChars);
  return (
    <p className={line.indent ? "pl-4" : undefined}>
      {parts}
      {caret && <span className="animate-pulse text-cyan-400">▌</span>}
    </p>
  );
}

export default function TypedOutput({
  lines,
  onProgress,
  onDone,
}: {
  lines: OutputLine[];
  onProgress?: () => void;
  onDone?: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    const totalChars = lines[lineIdx].segments.reduce((n, s) => n + s.text.length, 0);
    if (charIdx >= totalChars) {
      const t = setTimeout(() => {
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, LINE_PAUSE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCharIdx((c) => c + 1);
      onProgress?.();
    }, CHAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx, lines, onDone, onProgress]);

  return (
    <div>
      {lines.slice(0, lineIdx).map((ln, i) => (
        <LineView key={i} line={ln} revealChars={Infinity} />
      ))}
      {lineIdx < lines.length && <LineView line={lines[lineIdx]} revealChars={charIdx} caret />}
    </div>
  );
}
