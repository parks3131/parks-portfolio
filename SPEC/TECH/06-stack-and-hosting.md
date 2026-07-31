# Stack and hosting

Every choice, with the reason. Where a decision was contested it links to its ADR.

| Choice | Why |
|---|---|
| **Next.js 16, App Router** | Static page plus one dynamic route is exactly its shape, and Vercel deploys it with no config |
| **React 19** | Comes with Next 16 |
| **TypeScript, strict** | Non-negotiable for a repo maintained in bursts months apart |
| **Tailwind 4** | The UI is a terminal: a handful of colours and monospace text. A design system would be overhead |
| **Vercel** | Zero-config Next hosting, and the Node runtime the chat route needs |
| **Neon Postgres + pgvector** | Serverless-friendly Postgres, and pgvector means the corpus lives in a real database rather than a bespoke index. See [ADR-0002](../decisions/0002-retrieval-not-a-static-system-prompt.md) |
| **OpenAI embeddings only** | `text-embedding-3-small` is cheap, good, and 1536 dimensions is a convenient size. Embeddings are the one place a model swap is expensive, so it is deliberately boring |
| **OpenRouter for completions** | One key, many models, swappable by env var without a code change. The chat model is the part most likely to change |
| **Upstash Redis** | HTTP-based, so it works from a serverless function without connection pooling |
| **three.js via @react-three/fiber** | Declarative scene graph that matches how the rest of the app is written |
| **@react-three/rapier** | Physics for the lanyard. Chosen over hand-rolled verlet because joints and sleeping are already correct |
| **meshline** | A line with real width. Plain `THREE.Line` cannot do it |

## Environment

| Variable | Used for |
|---|---|
| `OPENROUTER_API_KEY` | Chat completions |
| `OPENROUTER_MODEL` | Chat model. Defaults to `meta-llama/llama-3.3-70b-instruct` |
| `OPENAI_API_KEY` | Embeddings, at reindex time and per question |
| `DATABASE_URL` | Neon pooled connection string |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limiting |

Missing `OPENROUTER_API_KEY` is handled explicitly with a 500 and a clear message. The others
throw from their lazy initialisers, which surfaces as a generic 500. That asymmetry is worth
fixing.

## Deployment

Push to `main`. Vercel builds and promotes. There is no preview-then-promote step and no staging
database: **the corpus index is production**, and a preview deployment reads the same one.
