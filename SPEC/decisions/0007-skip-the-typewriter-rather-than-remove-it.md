# ADR-0007: Keep the typewriter and make it skippable

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

## Context

Output types out at 10ms per character. It is the effect that makes the terminal read as a
terminal rather than as a styled div, and it is the first thing a visitor notices.

It is also slow. `projects` is several thousand characters, which is roughly fifteen seconds of
watching text appear when the visitor has already decided they want to read it. Line-by-line
reveal was tried as a middle ground and lost the character of the effect entirely.

## Decision

We will keep character-by-character typing and let a click anywhere in the terminal, or any
keypress, reveal everything currently animating.

## Consequences

| | |
|---|---|
| Positive | Keeps the effect for the visitor seeing it for the first time, and costs nothing for the visitor who wants the content now. The interaction is discoverable because impatience is the natural gesture. |
| Negative | Two ways to reach a completed transcript, so the completion path is exercised twice and has to be right in both. |
| Follow-up needed | None. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| Line-by-line instead of character-by-character | Tried. Fast enough, but the effect stops reading as typing and becomes a list appearing, which is the whole reason it exists. |
| Speed up the characters | Trades the effect's texture against the wait without resolving either, and the right speed differs per visitor. |
| Remove the typewriter | The site is a terminal. This is the atmosphere. |
| A visible "skip" button | More chrome for something a click already does, in a UI whose entire premise is that you interact by typing and clicking, not by finding controls. |
