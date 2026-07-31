const JAILBREAK_PATTERNS: RegExp[] = [
  /ignore (all|any|the)?\s*(previous|above|prior)\s*(instructions?|rules?|prompts?)/i,
  /disregard (all|any|the)?\s*(previous|above|prior)\s*(instructions?|rules?|prompts?)/i,
  /you are (now|no longer)\b/i,
  /pretend (that )?you('re| are)\b/i,
  /reveal (your |the )?(system prompt|instructions)/i,
  /(what|show me) (is|are)? ?your (system prompt|instructions)/i,
  /\bjailbreak\b/i,
  /\bDAN mode\b/i,
  /\bdeveloper mode\b/i,
  /bypass your (rules?|restrictions?|guidelines?)/i,
  /repeat (the text|everything) above/i,
];

const MAX_MESSAGE_LENGTH = 800;

export function checkInput(message: string): { allowed: boolean; reason?: string } {
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { allowed: false, reason: "Message is too long." };
  }
  if (JAILBREAK_PATTERNS.some((pattern) => pattern.test(message))) {
    return { allowed: false, reason: "That's not something I can help with here — ask me about Parks's work or background." };
  }
  return { allowed: true };
}

// The system prompt is built from XML-style section tags (see systemPrompt.ts).
// A reply containing one of those tags — or a verbatim line from the prompt — is
// echoing the scaffolding itself, which no legitimate answer ever needs to do.
// One hit is enough.
const PROMPT_SECTIONS = [
  "role",
  "persona",
  "grounding_rules",
  "scope",
  "assistant_behavior",
  "context",
  "contact",
  "style_rules",
];

const STRONG_LEAK_PATTERNS: RegExp[] = [
  new RegExp(`</?(?:${PROMPT_SECTIONS.join("|")})>`, "i"),
  /you are the ai persona embedded in/i,
  /ground every answer strictly in the context/i,
  /retrieved from parks's resume and project write-ups/i,
];

// Weaker signals: `### ` is how retrieved chunks are titled, and the rest are
// leftovers from the pre-XML prompt format. Each is individually plausible in a
// normal answer, so these need corroboration before tripping the guard.
const WEAK_LEAK_MARKERS = ["### ", "CONTEXT:", "Style rules:", "CONTACT:"];

export function checkOutput(reply: string): string {
  const strongHit = STRONG_LEAK_PATTERNS.some((pattern) => pattern.test(reply));
  const weakHits = WEAK_LEAK_MARKERS.filter((marker) => reply.includes(marker)).length;
  if (strongHit || weakHits >= 2) {
    return "I can't share that directly, but happy to answer questions about Parks's experience, projects, or skills.";
  }
  return reply;
}

export { MAX_MESSAGE_LENGTH };
