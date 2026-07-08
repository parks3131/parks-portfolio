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

const LEAK_MARKERS = ["CONTEXT:", "### ", "Style rules:", "CONTACT:"];

export function checkOutput(reply: string): string {
  const looksLeaked = LEAK_MARKERS.filter((marker) => reply.includes(marker)).length >= 2;
  if (looksLeaked) {
    return "I can't share that directly, but happy to answer questions about Parks's experience, projects, or skills.";
  }
  return reply;
}

export { MAX_MESSAGE_LENGTH };
