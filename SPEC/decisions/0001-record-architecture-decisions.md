# ADR-0001: Record architecture decisions

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

## Context

This repo is maintained in bursts months apart, by its owner and by agents that arrive with no
memory of the last session. Decisions that were obvious at the time - why retrieval instead of a
static prompt, why two content files, why the guard keys on tags - are invisible in the diff and
get re-litigated or, worse, quietly reversed by someone tidying up.

The same practice already exists in
[ClubChat-Remastered](https://github.com/parks3131/ClubChat-Remastered) and has paid for itself
there.

## Decision

We will record every architectural decision as a numbered ADR in `SPEC/decisions/`, using
[the template](../templates/adr-template.md). An ADR is immutable once accepted: a change of mind
is a new ADR that supersedes the old one, never an edit.

## Consequences

| | |
|---|---|
| Positive | The rejected alternative survives, which is the part that stops a decision being reversed by someone who only sees the current state. A new session can read the tree and be current. |
| Negative | Writing overhead on any non-trivial change, and a tree that must be kept honest or it becomes lying documentation. |
| Follow-up needed | None. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| Comments in the code | They explain the line, not the alternative that was rejected, and they disappear when the line is refactored. |
| Commit messages | Correct place for the narrative, wrong place for a durable decision: nobody greps a year of history before changing a file. |
| One long ARCHITECTURE.md | Becomes append-only and internally contradictory. That is exactly what ClubChat's tree was split out of. |
