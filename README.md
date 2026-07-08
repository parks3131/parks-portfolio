# Parks RPK — Portfolio

An interactive terminal-style portfolio for Parksunnath RPK, built with Next.js. Visitors can type commands (`about`, `projects`, `skills`, ...) or ask free-text questions answered by a retrieval-augmented AI chat grounded in real resume/project data — all behind a draggable, physics-based 3D lanyard badge.

Live at [parkstechusa.com](https://parkstechusa.com).

## Features

- **Terminal UI** — a fake shell (`Terminal.tsx`) with a fixed set of commands (`help`, `about`, `projects`, `skills`, `experience`, `contact`, `education`, `certifications`, `leadership`, `sudo`, `clear`) rendered with a typewriter effect, plus free-text input that's routed to the AI chat.
- **3D lanyard badge** — a physics-simulated badge on a lanyard (`react-three/fiber` + `react-three/rapier` + `meshline`) that can be dragged around the page, with an ID-card badge mirrored on both faces so it reads correctly from any angle.
- **RAG-powered AI chat** — the free-text terminal input isn't a single hardcoded system prompt. It retrieves relevant chunks from an embedded corpus per question, so answers stay grounded and the corpus can grow without bloating every request.
- **Guardrails + rate limiting** — the chat endpoint is public and spends real API credits, so it's protected by input/output guardrails and per-IP rate limiting.

## How the AI chat works

```
visitor question
      │
      ▼
[rate limit check]  — Upstash Redis, sliding window per IP
      │
      ▼
[input guardrail]   — regex prefilter for jailbreak/prompt-injection attempts
      │
      ▼
[retrieval]          — embed the question (OpenAI text-embedding-3-small),
      │                 cosine-similarity search against a pgvector table on Neon
      ▼
[prompt build]       — persona system prompt + top-k retrieved chunks + chat history
      │
      ▼
[OpenRouter call]     — chat completion (model configurable via OPENROUTER_MODEL)
      │
      ▼
[output guardrail]   — checks for system-prompt leakage before returning
      │
      ▼
reply to visitor
```

The corpus lives in `data/corpus.json` — resume sections (experience, education, skills, leadership) and detailed project write-ups, each chunked into a self-contained passage with a title and source tag. `scripts/reindex.ts` embeds every chunk and upserts it into a `chunks` table in Postgres (via Neon, with the `pgvector` extension); `src/lib/retrieve.ts` embeds the incoming question and does a `<=>` (cosine distance) similarity search to pull the top-k most relevant chunks per request.

Editing the corpus: update `data/corpus.json`, then run `npm run reindex` to re-embed and sync it to the database (it upserts by `id` and deletes any chunk no longer present in the file).

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **3D:** three.js, @react-three/fiber, @react-three/drei, @react-three/rapier (physics), meshline
- **AI chat:** OpenRouter (chat completions), OpenAI (embeddings only)
- **Retrieval:** PostgreSQL + pgvector, hosted on Neon
- **Rate limiting:** Upstash Redis (`@upstash/ratelimit`)

## Project structure

```
src/
  app/
    page.tsx              — landing page (badge + terminal)
    api/chat/route.ts      — chat API: rate limit → guardrails → retrieval → OpenRouter → guardrails
  components/
    LanyardScene.tsx        — R3F canvas + physics world
    LanyardBand.tsx         — the physical lanyard strap
    BadgeCard.tsx            — the badge geometry/text, mirrored on both faces
    Terminal.tsx             — terminal shell UI, command routing, chat input
    TypedOutput.tsx           — typewriter rendering effect
  lib/
    content.ts               — structured resume data driving the terminal's static commands
    commands.ts              — command parsing + rendering for the terminal
    systemPrompt.ts           — builds the chat's system prompt from retrieved context
    retrieve.ts                — embeds a query and runs the pgvector similarity search
    guardrails.ts                — input jailbreak/off-topic filter + output leak check
    rateLimit.ts                 — Upstash sliding-window rate limiter
    db.ts                        — Postgres connection pool
data/
  corpus.json                  — the RAG corpus (resume + project write-ups, chunked)
scripts/
  reindex.ts                   — embeds data/corpus.json and syncs it to Postgres
```

Note: `content.ts` (used by the terminal's static commands) and `data/corpus.json` (used by the AI chat's retrieval) are separate, deliberately duplicated sources — keep both in sync when updating resume/project info.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Chat completions |
| `OPENROUTER_MODEL` | Chat model (defaults to `meta-llama/llama-3.3-70b-instruct`) |
| `DATABASE_URL` | Neon Postgres pooled connection string (with `pgvector` enabled) |
| `OPENAI_API_KEY` | Embeddings (`text-embedding-3-small`) for the corpus and query retrieval |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |

After setting `DATABASE_URL` and `OPENAI_API_KEY`, run:

```bash
npm run reindex
```

This creates the `chunks` table (and the `vector` extension) if they don't exist, embeds every chunk in `data/corpus.json`, and upserts them into Postgres.

## Deployment

Deployed on Vercel (zero-config Next.js support, including the `nodejs` runtime the chat API needs for its Postgres/Upstash/OpenAI calls). Set the same environment variables in the Vercel project settings, then deploy.
