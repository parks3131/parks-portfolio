# AGENTS.md - working agreement

How any agent (or human) should work in this repo. Read this first, then
[`SPEC/README.md`](SPEC/README.md), which indexes the product spec, the technical spec and the
decisions.

Sections 0 through 4 are general engineering discipline and apply to every task, always,
without being restated. Section 5 is the repo-specific part.

This file is deliberately the same agreement used in
[ClubChat-Remastered](https://github.com/parks3131/ClubChat-Remastered). Where a rule reads as
oddly heavy for a portfolio site, that is the point: the discipline is the transferable part,
and a small repo is where it is cheap to keep.

---

## 0. Standing instructions

### Writing

1. **Never use an em dash (U+2014).** Use a plain hyphen (`-`) instead. This applies to code,
   comments, docs, commit messages, and anything shown to a user - including terminal output
   rendered by `src/lib/commands.ts`. Grep for it with `grep -rn $'\u2014' .`, which finds it without pasting the
   character into this file. **Verify your grep variant actually matches** against a file you
   know contains one before trusting a zero result; some variants (notably `-P` on macOS's BSD
   grep) silently match nothing and report a clean file full of them.
2. **Every commit is authored by the repo owner, with no co-author line.** The identity is
   `parks3131 <178941891+parks3131@users.noreply.github.com>`, already set in git config. Never
   override it with `--author`, and never append a `Co-Authored-By` trailer for an agent, model,
   or tool - not even when the agent's own defaults call for one. Commit messages carry the
   author's intent, not the tool's byline.

   The rule was adopted on 2026-07-31 and the history predating it does not follow it: all 15
   existing commits are authored `Parks RPK <parks3131@users.noreply.github.com>` and 13 of them
   carry a `Co-Authored-By` trailer. They are left alone, because correcting them means rewriting
   history that is already on the remote. The rule binds from here forward.

### Deciding

3. **Do not weight development cost heavily when making a technical decision.** Prefer, in
   this order: quality, simplicity, robustness, scalability, long-term maintainability.
   "It's faster to build" is close to worthless as an argument; "it's simpler to reason about
   in a year" is decisive. Record the reasoning in an ADR, including the rejected alternative
   and why, so it does not get re-litigated later.

### Fixing bugs

4. **Reproduce the bug end-to-end before fixing it.** Start by reproducing it the way a visitor
   would actually hit it: in the running app, in a browser, with the real chat endpoint. Not by
   reading code and reasoning about what might be wrong. A fix that was never preceded by a
   reproduction is a guess. Once fixed, re-run the same reproduction to prove it.

### Verifying

5. **Be picky about the UI. Pixel perfection is the standard.** When testing end to end, treat
   anything that looks off as a defect worth fixing, including things unrelated to the current
   task: a colour that does not match the accent, inconsistent spacing, a caret that lands on
   the wrong line, text that reflows when it should not. Fix it along the way rather than
   filing it.
6. **Hold engineering hygiene to the same bar.** A type error or a lint error gets fixed when
   you see it, whether or not you caused it.

### Reporting

7. **Report outcomes faithfully.** If a check fails, say so and show the output. If a step was
   skipped or part of the scope was left out, say that explicitly rather than letting a summary
   imply completeness. When something is done and verified, say so plainly without hedging.
8. **Never claim something works without having run it.** "Should work" is not a result. For
   this repo that specifically means: a change to the chat pipeline is not verified until a
   real question has been asked of the running endpoint and the answer read.

---

## 1. Non-negotiables

1. **Read the pinned, versioned documentation for any fast-moving dependency before writing
   code against it.** Training-data memory of an older major version is actively wrong, and it
   fails in the worst possible way: plausible code that a reviewer will not question. Next 16,
   React 19, Tailwind 4, and the `@react-three/*` stack all move fast and all have breaking
   majors behind them.
2. **`data/corpus.json` and the vector index are one change, never two.** Editing the corpus
   without running `npm run reindex` leaves production answering from stale embeddings, and
   nothing in the type system, the build, or the browser will tell you. See
   [`SPEC/templates/corpus-change-checklist.md`](SPEC/templates/corpus-change-checklist.md).
3. **`npm run reindex` writes to the production database.** There is no staging index. It
   upserts by `id` and **deletes every row whose id is absent from the file**, so running it
   against a truncated or half-edited corpus destroys chunks. Read the diff before running it.
4. **Type check and lint must pass before any change is "done."** No exceptions, no "I'll fix
   it in the next commit."
5. **No secrets in the repo.** `.env.local` is gitignored and stays that way. `OPENROUTER_API_KEY`,
   `OPENAI_API_KEY`, `DATABASE_URL` and the Upstash pair must never appear in code, docs, logs,
   or a commit message. The chat route is public and spends real money; a leaked key is a bill.
6. **Every guardrail change is proved against the real artifact, not reasoned about.** Feed the
   guardrail the actual current system prompt and watch it refuse. Reading the pattern list and
   concluding it looks right is not verification - that exact mistake has shipped twice here.
   See [`SPEC/TECH/07-engineering-pitfalls.md`](SPEC/TECH/07-engineering-pitfalls.md) entry 1.

---

## 2. Workflow

### 2.1 Before writing code

1. **Read [`SPEC/PRD/`](SPEC/PRD/)** for the intended behaviour, then
   **[`SPEC/TECH/`](SPEC/TECH/)** for how that area is built. Behaviour questions are answered
   by the first; structural questions by the second. Check
   [`SPEC/decisions/`](SPEC/decisions/) before reopening anything that looks settled.
2. **Find the closest existing pattern and mirror it.** Terminal output is built from
   `Segment`/`OutputLine` and nothing else. A new command is a new `render*` function plus a
   `COMMAND_LIST` entry, not a new rendering path.
3. **If a change touches what the site claims about Parks, confirm the fact before writing it.**
   Dates, titles, employers and metrics are not derivable by analogy, and the resume, the
   terminal and the corpus have already disagreed with each other once.

### 2.2 Writing code

| Layer | Rule |
|---|---|
| Page / layout | Composition only. No data shaping, no fetch. |
| Terminal | Commands return `OutputLine[]`. Never render raw strings into the transcript; go through `textToLines` so every line takes the same path. |
| Content | `src/lib/content.ts` is the only source for the static commands. No resume fact typed inline in a component. |
| Chat route | Rate limit, then input guard, then retrieve, then call, then output guard. The order is the contract; do not reorder for convenience. |
| Retrieval | One embedding call, one query. Never widen `TOP_K` to paper over a corpus that needs a better chunk. |
| Guardrails | Pure functions over a string, no I/O, so they stay trivially testable. |
| Styling | Tailwind utilities, and the accent colour is one token used everywhere. Never hardcode a second green. |
| 3D | Anything decorative is `raycast={() => null}`. The badge must stay draggable. |

### 2.3 Verifying

Order matters. Each step catches a class the previous one cannot.

1. **Type check.** `npx tsc --noEmit`, strict.
2. **Lint.** `npx eslint src` clean. The React purity and hooks rules here catch real bugs, not
   style: see pitfall 4.
3. **Production build.** `npm run build`. Dev and build disagree about React strictness and
   about what is allowed during render.
4. **Live smoke test in the running app**, in a browser. This catches what code review does not,
   and it is the only gate that sees the 3D scene, the typewriter, or a WebGL context loss.
5. **For anything touching the chat pipeline, ask the running endpoint a real question and read
   the answer.** A 200 response is not evidence the answer is grounded, and the corpus is the
   only place a wrong claim can hide.
6. **For anything touching the corpus, ask a question that should hit the changed chunk**, and
   confirm the new text is what comes back rather than the old.

### 2.4 Finishing

1. **Update the relevant product and technical docs in the same change.** A feature whose spec
   was not updated is not done.
2. **Append the narrative** (bugs hit, root causes, scope changes) to [`HISTORY.md`](HISTORY.md)
   under that task's heading. Keep the specs summary-level; they load into context every session
   and detail there is expensive.
3. **If a decision was architectural and non-obvious, write an ADR**, with the rejected
   alternative recorded.
4. **Commit only when asked.** No agent co-author line.
5. **Branch and review policy: solo, direct to main.** Recorded from observed practice rather
   than chosen freshly - every commit in this repo's history is on `main`, and Vercel deploys
   from it, so a branch does not ship. The gate is therefore not review but section 2.3.

---

## 3. Documentation contract

| Document | Answers | Must not contain |
|---|---|---|
| [`SPEC/PRD/`](SPEC/PRD/) | What the site does and why | File paths, schema, component names |
| [`SPEC/TECH/`](SPEC/TECH/) | How it is built, and what must not break | Product justification (link to the PRD instead) |
| [`SPEC/decisions/`](SPEC/decisions/) | Why we chose this over the alternative | Implementation detail that will drift |
| [`HISTORY.md`](HISTORY.md) | How we got here, bug by bug | Anything needed to work today |
| `AGENTS.md` (this file) | How to work | Anything specific to one feature |
| [`README.md`](README.md) | What a visitor or recruiter should understand | Anything an agent needs but a reader does not |

Start at [`SPEC/README.md`](SPEC/README.md), which indexes all of it.

**Where a doc disagrees with the repo, the repo is right and the doc is the bug.** Fix it in the
same change. This is the only rule that keeps a spec from going stale, and it only works if it is
applied every time rather than when convenient.

Keep the specs compact. If a story is long, it belongs in the history file.

---

## 4. General failure modes

Short list of things that are true across projects and have each cost a long debugging session
somewhere. Project-specific war stories go in
[`SPEC/TECH/07-engineering-pitfalls.md`](SPEC/TECH/07-engineering-pitfalls.md).

- **A check that pattern-matches another file's output goes silently dead when that file
  changes.** No error, no failing test, and the check reports success forever.
- **The same fact stated in two files will eventually be stated differently.** Either generate
  one from the other or write down which is authoritative.
- **A handler on a container fires for events its children raised.** If a child's action creates
  the thing the container's handler acts on, the container acts on it immediately.
- **`Math.random()` and `Date.now()` during render are not just impure, they break SSR and any
  re-render.** Seed a PRNG instead.
- **A "hang" with no console errors and no network activity is usually state logic**, not a
  stuck client.
- **A timestamp is not an ordering.** Clock skew is real.
- **At-least-once delivery means every effect must be idempotent.**

---

## 5. Project specifics

### 5.1 Commands

```bash
npm install                  # install

npm run dev                  # Next dev server on :3000
npm run build                # production build. Run before calling anything done
npm start                    # serve the production build
npm run lint                 # eslint

npx tsc --noEmit             # type check, strict
npx eslint src               # lint just the source

npm run reindex              # embed data/corpus.json and sync it to Postgres.
                             # WRITES TO PRODUCTION. Deletes chunks absent from the file.
                             # See non-negotiable 3.
```

There is no test suite. That is a real gap and it is recorded as such in
[`SPEC/PRD/04-roadmap-and-open-questions.md`](SPEC/PRD/04-roadmap-and-open-questions.md); until
it exists, section 2.3 steps 3 through 6 are the entire gate, and skipping them means the change
is unverified rather than lightly verified.

### 5.2 Repo map

| Path | What it is |
|---|---|
| `SPEC/README.md` | Index of everything below. Start here. |
| `SPEC/PRD/` | What the site does, one file per area |
| `SPEC/TECH/` | How it is built, one file per subsystem |
| `SPEC/decisions/` | Accepted ADRs. Immutable; supersede rather than edit |
| `SPEC/templates/` | Feature spec, ADR, corpus change checklist |
| `src/app/page.tsx` | Landing page. Composition only |
| `src/app/api/chat/route.ts` | The whole chat pipeline, in pipeline order |
| `src/lib/content.ts` | **The** source for the terminal's static commands |
| `src/lib/commands.ts` | Command parsing and rendering into `OutputLine[]` |
| `src/lib/systemPrompt.ts` | Builds the chat system prompt from retrieved chunks |
| `src/lib/retrieve.ts` | Embeds a query, runs the pgvector similarity search |
| `src/lib/guardrails.ts` | Input jailbreak filter and output leak check |
| `src/lib/rateLimit.ts` | Upstash sliding window, per IP |
| `src/lib/db.ts` | Postgres pool, cached on `globalThis` across hot reloads |
| `src/components/Terminal.tsx` | Shell UI, command routing, chat calls, skip handling |
| `src/components/TypedOutput.tsx` | Typewriter rendering |
| `src/components/Lanyard*.tsx`, `BadgeCard.tsx` | The 3D badge and its physics |
| `data/corpus.json` | The RAG corpus. Chunk ids are the primary key in Postgres |
| `scripts/reindex.ts` | Embeds the corpus and syncs it. Read non-negotiable 3 first |

**Where the two sources of truth are.** `src/lib/content.ts` drives what the terminal prints;
`data/corpus.json` drives what the chatbot knows. They are deliberately separate
([ADR-0003](SPEC/decisions/0003-two-sources-of-resume-truth.md)) and they have already drifted
once. Any change to a resume fact touches both, plus `public/Parks_RPK_Resume.pdf` if the resume
itself changed.
