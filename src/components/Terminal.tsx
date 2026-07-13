"use client";

import { useEffect, useRef, useState } from "react";
import { COMMAND_LIST, renderCommand, textToLines, type OutputLine } from "@/lib/commands";
import { profile } from "@/lib/content";
import TypedOutput from "@/components/TypedOutput";

type Entry = {
  id: number;
  command: string;
  lines: OutputLine[] | null;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

const PROMPT = "parks@portfolio:~$";

function welcomeLines(): OutputLine[] {
  return textToLines(
    `Hi, I'm ${profile.name}, a ${profile.title}.\n\nWelcome to my interactive portfolio terminal. Type 'help' to see available commands, or ask anything about me in plain English.`,
  );
}

export default function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, command: "welcome", lines: welcomeLines() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const idRef = useRef(1);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const runningCommandsRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clock must sync to real time on mount
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [entries, loading]);

  function focusInput() {
    inputRef.current?.focus();
  }

  async function runCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const key = trimmed.toLowerCase();

    if (key === "clear") {
      setEntries([]);
      chatHistoryRef.current = [];
      runningCommandsRef.current.clear();
      return;
    }

    // Ignore repeat clicks/submits of a command that's still typing out —
    // once it finishes (see onDone below), the same command can run again.
    if (runningCommandsRef.current.has(key)) {
      scrollToBottom();
      return;
    }
    runningCommandsRef.current.add(key);

    const staticLines = renderCommand(trimmed);
    const id = idRef.current++;

    if (staticLines !== null) {
      setEntries((prev) => [...prev, { id, command: trimmed, lines: staticLines }]);
      return;
    }

    setEntries((prev) => [...prev, { id, command: trimmed, lines: null }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: chatHistoryRef.current,
        }),
      });
      const data = await res.json();

      const replyText: string = res.ok ? data.reply : data.error || "Something went wrong.";

      const newHistory: ChatMessage[] = [
        ...chatHistoryRef.current,
        { role: "user", content: trimmed },
        { role: "assistant", content: replyText },
      ];
      chatHistoryRef.current = newHistory.slice(-20);

      const replyLines = textToLines(replyText).map((ln) =>
        res.ok ? ln : { ...ln, segments: ln.segments.map((s) => ({ ...s, className: "text-rose-400" })) },
      );

      setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, lines: replyLines } : entry)));
    } catch {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                lines: textToLines("Failed to reach the AI backend. Try a listed command instead.").map((ln) => ({
                  ...ln,
                  segments: ln.segments.map((s) => ({ ...s, className: "text-rose-400" })),
                })),
              }
            : entry,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = input;
    setInput("");
    void runCommand(value);
  }

  return (
    <div className="flex h-full flex-col text-sm text-neutral-200" onClick={focusInput}>
      <div className="border-b border-neutral-800 px-4 py-2 text-neutral-400 flex flex-wrap gap-x-2">
        {COMMAND_LIST.map((cmd, i) => (
          <span key={cmd}>
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 hover:underline"
              onClick={() => void runCommand(cmd)}
            >
              {cmd}
            </button>
            {i < COMMAND_LIST.length - 1 && <span className="text-neutral-700"> |</span>}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {entries.map((entry) => (
          <div key={entry.id}>
            <p>
              <span className="text-cyan-400">{PROMPT}</span>{" "}
              <span className="text-neutral-100">{entry.command}</span>
            </p>
            <div className="mt-1 text-neutral-300">
              {entry.lines === null ? (
                <span className="text-neutral-500">thinking…</span>
              ) : (
                <TypedOutput
                  lines={entry.lines}
                  onProgress={scrollToBottom}
                  onDone={() => {
                    scrollToBottom();
                    runningCommandsRef.current.delete(entry.command.toLowerCase());
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-neutral-800 px-4 py-2">
        <span className="text-cyan-400">{PROMPT}</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none disabled:opacity-50"
          placeholder={loading ? "waiting for response…" : "type a command or ask a question"}
          aria-label="Terminal input"
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-1 text-xs text-neutral-500">
        <span className="text-cyan-400">{PROMPT}</span>
        <span>{now ? now.toLocaleString() : ""}</span>
      </div>
    </div>
  );
}
