# Roadmap and open questions

What is deliberately deferred, what is accepted debt, and what is genuinely unresolved. Kept here
so none of it gets rediscovered as a surprise.

## Accepted debt

| Item | Why it is accepted | What it costs |
|---|---|---|
| **No test suite** | The site is small and every surface is visually verifiable | The guardrail regression in pitfall 1 would have been caught instantly by one assertion. This is the highest-value gap in the repo |
| **Two sources of resume truth** | See [ADR-0003](../decisions/0003-two-sources-of-resume-truth.md) | They have drifted once already |
| **Manual reindex** | Corpus changes are rare and deliberate | A corpus edit that is committed but not reindexed ships a lie |
| **No streaming** | Answers are short enough that a spinner is tolerable | Perceived latency on longer answers |
| **Rate limiter fails open** | Availability over enforcement | An attacker who can break Upstash reachability gets unlimited questions, bounded only by the input filter |

## Deferred features

- **Command history on the up arrow.** Expected by anyone who reads it as a real shell.
- **Tab completion** for commands.
- **Citations** in chat answers, back to the chunk they came from. The corpus already carries
  titles and source tags, so the data exists.
- **A structured evals harness** for the chat: a fixed question set, run against a changed corpus
  or prompt, checking groundedness and refusal behaviour. This is the natural next project and it
  matches the owner's stated interest in evals.

## Open questions

1. **Should the corpus be generated from `content.ts` rather than maintained beside it?** See
   ADR-0003 for why it is not today. The answer changes if the corpus starts carrying material
   the terminal never shows, which it now does.
2. **What is the right behaviour when retrieval returns nothing above a similarity threshold?**
   Today there is no threshold: the top k come back regardless of how weak the match is, and the
   model is left to notice. An explicit "no relevant context" path would be more honest.
3. **Should the site state the resume's facts or the site's facts when they disagree?** The
   resume currently says Arlington, VA and lists one Acarin role; the site says Binghamton, NY
   and additionally lists SUNY Research Foundation. This is unresolved and is a factual
   correctness issue, not a styling one.
