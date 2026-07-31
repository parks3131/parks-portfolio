# ADR-0004: Filter input with regex before the model call, not with a second model

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

## Context

The chat endpoint is public, unauthenticated, and spends the owner's API credit on every request.
It needs some defence against both prompt injection and simple abuse.

The threat model matters here and is easy to overstate. The model has no tools, no private data,
and no ability to act. Its context contains a corpus that is already public and a persona prompt
that is embarrassing to leak but not dangerous. The realistic attacker is a script or a bored
person with a loop, not someone with a budget.

## Decision

We will pre-filter input with a regex list and a length cap, positioned **before** retrieval so a
refusal costs nothing, and treat it explicitly as a prefilter rather than a security boundary.

## Consequences

| | |
|---|---|
| Positive | Zero added latency and zero cost on the happy path, and a refused message costs nothing at all - no embedding call, no completion. Trivially testable, because the guard is a pure function over a string. |
| Negative | Trivially bypassable by anyone who rephrases. It catches the low-effort majority and nothing else, and it will occasionally refuse a legitimate question that happens to contain a matching phrase. |
| Follow-up needed | None. If the threat model changes - if the model ever gets a tool - this decision must be revisited, because it is sized to a model that can only talk. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| A model-based classifier on every input | Doubles the cost and latency of the thing it is protecting, to guard a model that can only produce text about a public corpus. The cure costs more than the disease. |
| A managed moderation or prompt-injection API | Another vendor, another key, another failure mode, for a portfolio chatbot. |
| Nothing at all | The endpoint is public and metered. Some floor is required, and the regex is nearly free. |
| Put the filter after retrieval | Refusals would still be correct but would each spend an embedding call, which is exactly the cost a scripted abuser would exploit. |
