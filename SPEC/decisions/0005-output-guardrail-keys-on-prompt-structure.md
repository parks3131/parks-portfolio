# ADR-0005: Key the output leak check on the prompt's own section tags

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

## Context

The output guard exists to catch the system prompt being echoed back to a visitor. It has now
gone silently dead **twice**, both times because it was matching the shape of a prompt that had
since been rewritten - first plain-text headers, then a `CONTEXT:` format, while the prompt moved
on to XML-ish section tags. In its dead state it did not error; it approved. A full prompt leak
would have been passed through.

The root problem is that the guard and the prompt are coupled in fact but not in code: nothing
fails when they diverge.

## Decision

We will key the guard on the prompt's **structural markers** - its section tags, plus verbatim
lines from it - in two tiers: a single structural tag is enough to refuse, while weaker markers
that a real answer might plausibly contain need corroboration.

We accept the coupling to `systemPrompt.ts` as deliberate, and record that the two files change
together, always.

## Consequences

| | |
|---|---|
| Positive | A structural tag like `</scope>` cannot appear in a legitimate answer, so one hit is decisive and the check is both sensitive and specific. Tiering keeps `### `, which a model may legitimately emit, from causing false refusals on its own. |
| Negative | The coupling is real and undetectable by the compiler. Rewriting the prompt's section names without updating the guard puts it straight back into its dead state. |
| Follow-up needed | The durable fix is a test that feeds `buildSystemPrompt(...)` output to `checkOutput` and asserts refusal. That assertion would have caught both historical failures the moment they were introduced. Until the repo has a test runner, [`AGENTS.md`](../../AGENTS.md) non-negotiable 6 carries it by hand. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| Keep matching plain-text headers | This is the state that failed twice. |
| Derive the markers programmatically from the prompt builder | The right answer and it stays open. It needs the prompt's sections to be data rather than a template literal, which is a worthwhile refactor and larger than the fix it enables. |
| Ask a second model whether the output leaked the prompt | Doubles cost and latency on every answer, and gives a probabilistic answer to a question that string matching answers exactly. |
| Drop the check, since the prompt is not secret | The prompt is not a credential, but a chatbot that dumps its own instructions on request reads as broken to precisely the audience this site is for. |
