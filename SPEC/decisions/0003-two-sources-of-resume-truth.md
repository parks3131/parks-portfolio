# ADR-0003: Keep the terminal's content and the chat's corpus as separate sources

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

## Context

`src/lib/content.ts` drives the static commands. `data/corpus.json` is what the chatbot
retrieves from. They overlap: both carry the projects, the experience, the skills.

The obvious move is to generate the corpus from `content.ts` so the fact exists once. The reason
not to is that they are not the same material. `content.ts` is terminal output: short, scannable,
formatted into columns and bullets. A corpus chunk is a self-contained passage written to be
retrieved alone and read by a model - prose, with the context a bullet omits, and covering things
the terminal never shows at all, such as the debugging trail on a project or the reasoning behind
a rejected approach.

Generating one from the other would mean either the terminal prints paragraphs or the chatbot
retrieves bullet fragments. Both are worse than the duplication.

## Decision

We will maintain `content.ts` and `data/corpus.json` as separate authored sources, and manage the
overlap with a checklist rather than with codegen.

## Consequences

| | |
|---|---|
| Positive | Each surface gets material written for it. The corpus can carry depth the terminal has no room for, which is most of its value. |
| Negative | The same fact is stated twice and will drift. **It has already drifted once**, shipping a chatbot that confidently described a rebuilt project's retired architecture - see [pitfall 2](../TECH/07-engineering-pitfalls.md). |
| Follow-up needed | The drift is currently caught by nothing. A test that asserts the shared facts (employers, dates, project names, links) match across both would close it, and is the cheapest real test this repo could have. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| Generate the corpus from `content.ts` | Produces chunks made of bullet fragments, which embed badly and read worse. It also caps the corpus at what the terminal shows, discarding the depth that is the whole reason for retrieval. |
| Generate `content.ts` from the corpus | Inverts the problem: the terminal would print paragraphs written for a model. |
| One source with per-surface views | The honest version of this, and it stays open. It needs a schema expressive enough for both, which is real design work for a two-surface site. Revisit if a third surface appears. |
