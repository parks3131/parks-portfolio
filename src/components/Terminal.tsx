"use client";

import { useEffect, useRef, useState } from "react";
import {
  COMMAND_LIST,
  completeCommand,
  completionLines,
  renderCommand,
  textToLines,
  type OutputLine,
} from "@/lib/commands";
import { profile } from "@/lib/content";
import TypedOutput from "@/components/TypedOutput";

type Entry = {
  id: number;
  // null renders no prompt line, for output that was not a command: a tab
  // completion's candidate list.
  command: string | null;
  lines: OutputLine[] | null;
  // Shown in full straight away rather than typed out. A shell prints its
  // completion candidates instantly, and watching them appear letter by letter
  // would make tab slower than typing the command.
  instant?: boolean;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

const PROMPT = "parks@portfolio:~$";

function welcomeLines(): OutputLine[] {
  return textToLines(
    `Hi, I'm ${profile.name}.\n\nWelcome to my interactive portfolio terminal. Not a terminal person? Just click the green commands at the top to read about me - no typing needed.\n\nOr type 'help' to see every command, and ask anything about me in plain English.`,
  );
}

export default function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, command: "welcome", lines: welcomeLines() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  // Entries with an id at or below this are shown in full immediately:
  // clicking the terminal or pressing a key skips whatever is still typing out.
  const [skipUpTo, setSkipUpTo] = useState(-1);
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

  // Clicking anywhere in the terminal reveals every entry that exists right
  // now. Anything typed afterwards gets a higher id, so it still animates.
  function handleTerminalClick() {
    focusInput();
    setSkipUpTo(idRef.current - 1);
  }

  // Same skip from the keyboard, so it works without reaching for the mouse.
  // Listening on the window rather than the terminal means Escape still works
  // when focus has wandered to a header link or the 3D canvas. Enter is safe
  // here: keydown fires before the form submits, so the watermark is taken
  // before runCommand hands the new entry a higher id.
  useEffect(() => {
    const MODIFIERS = ["Shift", "Control", "Alt", "Meta"];
    function handleKeyDown(e: KeyboardEvent) {
      if (MODIFIERS.includes(e.key)) return;
      setSkipUpTo(idRef.current - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

    // Ignore repeat clicks/submits of a command that's still typing out.
    // Once it finishes (see onDone below), the same command can run again.
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

  // Tab completion. Must preventDefault before anything else: the browser's
  // own behaviour for Tab is to move focus out of the input, and it does that
  // whether or not there is anything to complete.
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();

    const completion = completeCommand(input);
    if (completion.kind === "none") return;

    setInput(completion.value);
    if (completion.kind === "ambiguous") {
      setEntries((prev) => [
        ...prev,
        { id: idRef.current++, command: null, lines: completionLines(completion.matches), instant: true },
      ]);
    }
  }

  return (
    <div className="flex h-full flex-col text-sm text-neutral-200" onClick={handleTerminalClick}>
      <div className="border-b border-neutral-800 px-4 py-2 text-neutral-400 flex flex-wrap gap-x-2">
        {COMMAND_LIST.map((cmd, i) => (
          <span key={cmd}>
            <button
              type="button"
              className="text-green-500 hover:text-green-400 hover:underline"
              onClick={(e) => {
                // Don't let this reach the container's skip handler, or the
                // command would skip the animation it just started.
                e.stopPropagation();
                void runCommand(cmd);
              }}
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
            {entry.command !== null && (
              <p>
                <span className="text-green-500">{PROMPT}</span>{" "}
                <span className="text-neutral-100">{entry.command}</span>
              </p>
            )}
            <div className="mt-1 text-neutral-300">
              {entry.lines === null ? (
                <span className="text-neutral-500">thinking…</span>
              ) : (
                <TypedOutput
                  lines={entry.lines}
                  revealAll={entry.instant === true || entry.id <= skipUpTo}
                  onProgress={scrollToBottom}
                  onDone={() => {
                    scrollToBottom();
                    if (entry.command !== null) {
                      runningCommandsRef.current.delete(entry.command.toLowerCase());
                    }
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-neutral-800 px-4 py-2">
        <span className="text-green-500">{PROMPT}</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 bg-transparent outline-none disabled:opacity-50"
          placeholder={loading ? "waiting for response…" : "type a command or ask a question"}
          aria-label="Terminal input"
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-1 text-xs text-neutral-500">
        <span className="text-green-500">{PROMPT}</span>
        <span>{now ? now.toLocaleString() : ""}</span>
      </div>
    </div>
  );
}
