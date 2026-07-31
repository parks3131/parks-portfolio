# Feature: `<name>`

Copy to `SPEC/PRD/<NN>-<kebab-name>.md`. Keep it to behaviour: **no file paths, no component
names** - those belong in `SPEC/TECH/`. Link across instead of duplicating.

<!-- Delete every instruction comment before committing. -->

## Purpose

<!-- What a visitor can do that they could not before. If it does not help someone decide
whether to contact Parks, question whether it belongs - see PRD/00-overview.md. -->

`<purpose>`

## Behaviour rules

<!-- Numbered, so they can be cited from ADRs and other specs. One rule per line. State the
rule, not the implementation. Bold the ones that have already been got wrong once. -->

1. `<rule>`

## Degraded behaviour

<!-- PRD/00-overview.md rule 2: the floor must not depend on the ceiling. State what this does
when the chat endpoint is down, when WebGL is unavailable, and when JavaScript is slow. If the
answer is "unaffected", say so. -->

| Condition | Behaviour |
|---|---|
| Chat endpoint down | |
| WebGL unavailable | |
| Narrow viewport | |

## Cost

<!-- Does this spend money per visitor? A model call, an embedding, a third-party request? If
yes, say what bounds it. If no, say "none". -->

`<cost per interaction, or "none">`

## Edge cases

| State | Behaviour |
|---|---|
| Empty / nothing yet | |
| Loading | |
| Load failed | |
| Interrupted mid-animation | |

## Content sources touched

<!-- Which of content.ts, corpus.json and the resume PDF this reads from. Anything that states
a resume fact must say so here, and use the corpus change checklist. -->

- `<source>`

## Out of scope

<!-- What this deliberately does NOT do, so it is not added later by drift. -->

- `<non-goal>`

## Acceptance criteria

<!-- Checkable by someone who did not build it, in a real browser. Prefer "verified by asking
the running endpoint" over "the code looks right". -->

- [ ] `<criterion>`

## Open questions

- `<question>`
