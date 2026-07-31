# ADR-0006: Run the chat route on the Node.js runtime, not Edge

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

## Context

The chat route talks to three things: Postgres over TCP via `pg`, Upstash over HTTP, and two
model APIs over HTTP. Edge is the reflexive choice for an API route on Vercel and would be wrong
here.

## Decision

We will pin the chat route to the Node.js runtime with `export const runtime = "nodejs"`.

## Consequences

| | |
|---|---|
| Positive | `pg` works, with a pooled connection cached across invocations. No constraint on which libraries can be used later. Longer execution budget than the latency of an embedding call plus a completion needs. |
| Negative | Cold starts are worse than Edge. Irrelevant next to a multi-second model call. |
| Follow-up needed | None. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| Edge runtime | No raw TCP, so `pg` cannot run. The route's dominant cost is a model call measured in seconds; optimising its cold start is optimising the wrong term. |
| Edge plus an HTTP database driver | Solves the connection problem and adds a dependency and a second way to query, to save latency that is invisible behind the model call. |
