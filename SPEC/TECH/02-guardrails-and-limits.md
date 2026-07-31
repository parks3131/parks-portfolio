# Guardrails and limits

Both guards are pure functions over a string with no I/O, which is what makes them trivially
testable. That property is worth protecting.

## Input guard

Runs before retrieval, so a refusal costs nothing.

| Check | Behaviour |
|---|---|
| Length over 800 characters | Refused |
| Jailbreak pattern match | Refused with a redirect to asking about Parks |

The patterns cover the common shapes: "ignore previous instructions", "you are now", "pretend you
are", "reveal your system prompt", "jailbreak", "DAN mode", "developer mode", "bypass your rules",
"repeat everything above".

This is a **prefilter, not a security boundary.** It stops the low-effort majority cheaply. The
real defence against a determined injection is that the model has nothing valuable to leak: no
tools, no private data beyond a corpus that is already public, and no ability to act.
See [ADR-0004](../decisions/0004-regex-prefilter-not-a-model-classifier.md).

## Output guard

Looks for the system prompt leaking into the answer, in two tiers.

| Tier | Trips on | Threshold |
|---|---|---|
| Strong | Any of the prompt's section tags (`<role>`, `<grounding_rules>`, `<context>`, `<style_rules>`, and the rest, opening or closing), or a verbatim line from the prompt | One hit |
| Weak | `### `, `CONTEXT:`, `Style rules:`, `CONTACT:` | Two hits |

A strong marker is worth one hit because no legitimate answer contains `</scope>`. The weak
markers are individually plausible in a real answer - `### ` is how chunk titles are formatted
and a model may echo one - so they need corroboration.

**This check is coupled to `systemPrompt.ts` by construction.** That coupling is deliberate and
is the whole point of [ADR-0005](../decisions/0005-output-guardrail-keys-on-prompt-structure.md),
but it means the two files change together, always. It has silently gone dead twice; see
[pitfall 1](07-engineering-pitfalls.md).

## Rate limit

Upstash sliding window, 10 requests per minute, keyed by IP from `x-forwarded-for` (first entry)
falling back to `x-real-ip`.

**It fails open.** If Upstash is unreachable the error is logged and the request proceeds. The
reasoning: this is a portfolio, and a reader hitting a broken chat because a rate limiter is down
is a worse outcome than an abuser getting a free window. That trade would be wrong if the
endpoint could do anything but talk.

The IP is trusted from a header, which is only meaningful because Vercel sets it. Behind any
other proxy this is spoofable and the limit is decorative.
