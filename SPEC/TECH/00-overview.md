# Technical overview

## The request path

A static command never leaves the browser. A question takes this path, in this order, and the
order is the contract:

```
question
   |
   v
[rate limit]      Upstash sliding window, 10/min per IP. FAILS OPEN on error.
   |
   v
[input guard]     Length cap and jailbreak regex. A trip returns a fixed
   |              refusal and NEVER reaches the model, so it costs nothing.
   v
[retrieve]        Embed the question (OpenAI text-embedding-3-small),
   |              cosine search a pgvector table on Neon, take top 6.
   v
[build prompt]    Persona and grounding rules in XML-ish section tags,
   |              plus the retrieved chunks, plus the last 10 exchanges.
   v
[model]           OpenRouter chat completion, model set by env.
   |
   v
[output guard]    Look for the prompt's own structure leaking into the answer.
   |
   v
reply
```

Two things about that order are load-bearing:

- **The rate limit is first**, so a flood costs one Redis round trip rather than an embedding
  call plus a completion.
- **The input guard is before retrieval**, so a refused message costs nothing at all. Putting it
  after would still refuse correctly and still spend an embedding call on every attempt.

## The honest cost model

Every question spends money the owner pays: one embedding call plus one completion, capped at 500
output tokens. This is why a decorative chatbot has a rate limiter and a regex prefilter at all,
and why the input guard sits where it does. The threat is not a sophisticated attacker; it is a
script, or one bored person with a loop.

## Runtime shape

Two Vercel deployments' worth of behaviour in one project:

| Surface | Rendering |
|---|---|
| `/` | Static. Prerendered at build; the terminal and badge hydrate on the client |
| `/api/chat` | Dynamic, Node.js runtime. See [ADR-0006](../decisions/0006-node-runtime-not-edge.md) |

The badge is `ssr: false` and loads dynamically; it cannot server-render and must not block the
terminal.

## State

There is none that survives a page load. Chat history lives in a ref inside the terminal
component, capped at ten exchanges, and dies with the tab. There is no database of visitors, no
session, and no analytics on the chat.

The only durable state is the corpus, in Postgres, written exclusively by `npm run reindex`.

## Connections

`src/lib/db.ts` caches the Postgres pool on `globalThis`, because a serverless function is
re-imported on hot reload and per-request in development, and a new pool per request exhausts
Neon's connection limit. The OpenAI client and the rate limiter are cached in module scope for
the same reason.
