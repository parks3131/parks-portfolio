# Parks Portfolio - Spec Index

An interactive terminal portfolio. A visitor types commands into a fake shell, or asks a free-text
question that is answered by a retrieval-augmented chat grounded in a corpus of resume and project
write-ups, behind a physics-simulated 3D lanyard badge.

**Stack:** Next.js 16 (App Router) - React 19 - TypeScript - Tailwind 4 - three.js via
`@react-three/fiber` and `@react-three/rapier` - OpenAI embeddings - Neon Postgres with pgvector -
Upstash Redis - OpenRouter - Vercel.

Live at [parkstechusa.com](https://parkstechusa.com).

---

## How to read this

| If you want | Read |
|---|---|
| What the site does and why | [`PRD/`](PRD/) |
| How it is built, and what must not break | [`TECH/`](TECH/) |
| Why a decision was made, and what was rejected | [`decisions/`](decisions/) |
| To add a command, a feature, or a corpus change | [`templates/`](templates/) |
| How to work in this repo | [`../AGENTS.md`](../AGENTS.md) |
| How we got here, bug by bug | [`../HISTORY.md`](../HISTORY.md) |

**Start here:** [PRD/00-overview.md](PRD/00-overview.md) →
[TECH/00-overview.md](TECH/00-overview.md) →
[TECH/07-engineering-pitfalls.md](TECH/07-engineering-pitfalls.md).

**One thing to know before changing anything.** This site makes public claims about a real person
and spends real money on every question a stranger asks it. Those two facts drive most of what
follows: why there are guardrails and a rate limit on a decorative chatbot, why a stale corpus is
treated as a production incident rather than a content typo, and why
[TECH/07-engineering-pitfalls.md](TECH/07-engineering-pitfalls.md) is not background reading.

---

## PRD - what the site does

| # | Document | Covers |
|---|---|---|
| 00 | [Overview](PRD/00-overview.md) | Who it is for, the bet, principles, goals, non-goals |
| 01 | [Terminal](PRD/01-terminal.md) | The command surface, the transcript, input and skip behaviour |
| 02 | [AI chat](PRD/02-ai-chat.md) | What the chatbot will and will not answer, and how it must behave when it does not know |
| 03 | [Badge](PRD/03-badge.md) | The 3D lanyard badge and what it is allowed to cost |
| 04 | [Roadmap and open questions](PRD/04-roadmap-and-open-questions.md) | Known gaps, accepted debt, and what is deliberately deferred |

Behaviour rules are numbered so they can be cited from ADRs and other specs.

## TECH - how it is built

| # | Document | Covers |
|---|---|---|
| 00 | [Overview](TECH/00-overview.md) | The request path end to end, and the honest cost model |
| 01 | [Retrieval](TECH/01-retrieval.md) | Embedding, the pgvector search, chunking, and what the prompt is built from |
| 02 | [Guardrails and limits](TECH/02-guardrails-and-limits.md) | The input filter, the output leak check, and the per-IP rate limit |
| 03 | [Content and corpus](TECH/03-content-and-corpus.md) | The two sources of truth, the reindex contract, and how they drift |
| 04 | [Terminal rendering](TECH/04-terminal-rendering.md) | `Segment`/`OutputLine`, the typewriter, and skip |
| 05 | [Badge scene](TECH/05-badge-scene.md) | The physics rig, the joints, and the ways it crashes |
| 06 | [Stack and hosting](TECH/06-stack-and-hosting.md) | Every technology choice, with its rationale |
| 07 | [Engineering pitfalls](TECH/07-engineering-pitfalls.md) | **The war stories.** Read before touching guardrails, the corpus, or the scene |

## Decisions

Immutable once accepted. A spec says what and how; an ADR says **why this and not that**.

| # | Decision |
|---|---|
| [0001](decisions/0001-record-architecture-decisions.md) | Record architecture decisions |
| [0002](decisions/0002-retrieval-not-a-static-system-prompt.md) | Retrieve per question instead of stuffing one static system prompt |
| [0003](decisions/0003-two-sources-of-resume-truth.md) | Keep the terminal's content and the chat's corpus as separate sources |
| [0004](decisions/0004-regex-prefilter-not-a-model-classifier.md) | Filter input with regex before the model call, not with a second model |
| [0005](decisions/0005-output-guardrail-keys-on-prompt-structure.md) | Key the output leak check on the prompt's own section tags |
| [0006](decisions/0006-node-runtime-not-edge.md) | Run the chat route on the Node.js runtime, not Edge |
| [0007](decisions/0007-skip-the-typewriter-rather-than-remove-it.md) | Keep the typewriter and make it skippable |

## Templates

| Document | Use when |
|---|---|
| [Feature spec](templates/feature-spec-template.md) | Adding a command or a surface |
| [Corpus change checklist](templates/corpus-change-checklist.md) | Touching `data/corpus.json` or any resume fact. **Every item on it has drifted once.** |
| [ADR template](templates/adr-template.md) | Recording an architectural decision |

---

## Conventions

- **PRD says what, TECH says how.** No file paths, schema or component names in `PRD/`; no
  product justification in `TECH/`. Link across instead of duplicating.
- **An ADR is immutable.** Change a decision by superseding it with a new ADR, never by editing
  the old one. The rejected alternatives are the point.
- **Keep it compact.** This tree is loaded into context. Long narratives belong in
  [`../HISTORY.md`](../HISTORY.md), not in a spec.
- **The repo wins.** Where a doc disagrees with the code, the code is right and the doc is the
  bug - fix it in the same change.
