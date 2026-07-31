# HISTORY

How we got here, bug by bug. The specs say what is true now; this says what happened, including
the things that were wrong on the way. Nothing here should be needed to work today - if it is, it
belongs in `SPEC/` instead.

Newest first.

---

## 2026-07-31 - Badge photo

**The photo went in twice.** First as a square crop of the head, dropped into the existing circle
with its green ring, which is what the old avatar was. Then, on the owner's call, as the whole
frame with the background removed, so the figure stands on the card instead of sitting in a
medallion. The second version is what shipped, and it took the circle and the ring with it.

**Keying the background needed a flood fill, not a threshold.** The photo is a person in a
stars-and-stripes tank top on white. Any "make white transparent" rule punches holes through the
stripes and the stars. Filling inward from the border instead removes only the white connected to
the frame, and the shirt survives intact.

**A one-channel mask came back as three.** sharp promotes a raw single-channel image to three
channels on the way out, so reading the blurred mask back one byte per pixel silently produced a
striped alpha over the whole image rather than an error. Visible immediately when the cutout was
composited over the card colour, and confirmed with a ten-by-ten buffer: 100 pixels in, 300 bytes
out. `toColourspace("b-w")` before `.raw()` fixes it, and the script asserts the length now.

Two smaller things fell out of the full-frame version. The photo crops the body mid-torso, so its
bottom fades to nothing over the last 14% rather than ending on a hard line, and the name moved
below the fade rather than sitting on top of the figure.

**Then it looked soft, and that had three causes at once.** The texture had been written at 720px
from a 1027px source and palette-quantised on top of that; the card swings, so it is sampled at a
slant, and nothing was set for anisotropy; and the source is a phone photo that was never crisp
to begin with. Fixed as three: full source resolution, `anisotropy` on the texture, and an
unsharp mask baked into the asset. Canvas DPR was checked and exonerated - R3F already defaults
to `[1, 2]`.

Setting anisotropy is where the immutability lint bit: assigning to `avatarMap.anisotropy` in an
effect is "modifying a value returned from a hook." It goes in `useTexture`'s load callback
instead. Same family as [pitfall 4](SPEC/TECH/07-engineering-pitfalls.md).

The keying script started as a one-off against a file outside the repo, then had to be written a
second time an hour later for the resolution fix, which is the argument for keeping it:
[`scripts/photo-cutout.mjs`](scripts/photo-cutout.mjs) now takes a source and a destination.

---

## 2026-07-31 - A welcome for visitors who do not use terminals

The opening line told a visitor to type `help`. That assumes the reader knows what a prompt is,
and the people this site exists to reach - recruiters, hiring managers - largely do not. The
green commands in the bar have been buttons the whole time and nothing said so. The welcome now
says it first, and mentions typing second.

---

## 2026-07-31 - Tab completion

Closed the "tab completion" item that had been sitting in the roadmap's deferred list for a few
hours. Shell behaviour: one match completes outright, several complete as far as they agree and
then print the candidates, an empty input prints everything, and no match does nothing.

Two things worth recording.

**`preventDefault` has to run before the decision, not after it.** Tab's default is to move focus
out of the input, and the browser does that regardless of whether a completion was found. Guarding
it behind "did we find something" loses focus on every unmatched Tab, which is the case a user
hits most while exploring.

**Candidates needed two new fields on `Entry`, and both earn their place.** `command: null`
suppresses the prompt line, because a candidate list is not a command that was run, and
`instant: true` reveals it whole, because typing a completion list out character by character
would make Tab slower than typing the command it exists to save.

Verified in the browser rather than by reading: `exp` completes to `experience` with focus intact,
`c` lists contact/certifications/clear and leaves the input at `c`, an unmatched prefix adds no
transcript entry, and a prefix containing a space is inert.

One honest gap: no two commands currently share more than a single leading character, so the
longest-common-prefix **extension** branch never fires. The function runs and returns correctly
for the empty-input case, but that path gets real coverage only when two commands share a longer
prefix. It is correct by inspection and untested by exercise.

Also fixed the two em dashes in `Terminal.tsx`'s comments while in the file. The two in
`commands.ts` are visible UI copy, in the `help` table and the `sudo` joke, and were left alone
because that decision is still open.

## 2026-07-31 - Spec tree adopted

Ported the working agreement and spec structure from
[ClubChat-Remastered](https://github.com/parks3131/ClubChat-Remastered): `AGENTS.md`, `SPEC/PRD`,
`SPEC/TECH`, `SPEC/decisions`, `SPEC/templates`, and this file.

Sections 0 through 4 of `AGENTS.md` are the same stack-agnostic discipline, deliberately
unchanged. Section 5 and the whole `SPEC/` tree are new and specific to this repo. Seven ADRs
were written **after the fact**, recording decisions that had already shipped, because the
reasoning existed only in conversation and was at risk of being reversed by whoever tidied up
next.

Two conventions from ClubChat are recorded in `AGENTS.md` but **not yet true of this repo**, and
both are flagged rather than silently enforced:

- **No em dash.** 67 occurrences currently exist across `src/`, `data/` and `README.md`,
  including deliberate UI copy in `src/lib/commands.ts`, where it separates a command from its
  description in the `help` table, and in the certification strings. ClubChat has 1, and a `lint:emdash` script to keep it that way.
- **No co-author trailer on commits.** 13 of this repo's 15 commits carry one, and every commit
  is authored `Parks RPK <parks3131@users.noreply.github.com>` rather than the `parks3131`
  identity ClubChat uses. Resolved the same day: git config now matches ClubChat and the rule
  binds forward. The existing history is left alone rather than rewritten on the remote.

Neither was changed as part of writing the docs, because both are the owner's call and one of
them rewrites visible UI copy.

## 2026-07-31 - Resume restructure, guardrail fix, terminal green, badge fire

A single long session, in roughly this order.

**The dead output guardrail.** Found while reading the repo, not from a symptom. `checkOutput`
required two of `CONTEXT:`, `### `, `Style rules:`, `CONTACT:`, but the system prompt had since
been rewritten into XML-ish section tags. Fed the real prompt through the real function: it
matched exactly one marker and returned the prompt unchanged, meaning **a full system-prompt leak
would have reached the visitor.** Rewrote it as two tiers (structural tags and verbatim prompt
lines trip on one hit; the old plain-text markers still need two) and verified with eleven cases
including the complete prompt. Recorded as [ADR-0005](SPEC/decisions/0005-output-guardrail-keys-on-prompt-structure.md)
and [pitfall 1](SPEC/TECH/07-engineering-pitfalls.md).

Worth noting how it was found: the same class had already been caught once before, in review, and
written up in the corpus as a proud moment. It then recurred, because the fix was to the
*instance* and not to the class. The class is "a guard that pattern-matches another file's
output".

**Resume restructure.** Read `Parks_RPK_Resume.pdf` and reordered projects to match it, ClubChat
first. Added the PDF to `public/` with a header link, a `contact` line, and a mention in the
system prompt so the chat can point recruiters at it.

**ClubChat was described wrong.** The site's ClubChat entry, and all five corpus chunks about it,
described the retired Supabase and row-level-security version. Confirmed against the local
`ClubChat-Remastered` working copy that the current build is Fastify, Postgres 17, Drizzle,
Redis, WebSockets. Replaced the five chunks with eight covering the domain model, the v1
postmortem, the architecture, the channel log, authorization, the outbox and push, and
verification. The chatbot had been confidently answering with a bug story that no longer applied.
This is [pitfall 2](SPEC/TECH/07-engineering-pitfalls.md) and the reason
[ADR-0003](SPEC/decisions/0003-two-sources-of-resume-truth.md) exists.

Also merged the two news projects into one `Parks's News` entry. The resume's "70+ sources"
reconciles as 55 newsletter feeds plus 18 web app sources, so no fact needed changing - only the
framing.

**Acarin merged.** The site listed two Acarin roles with 2026 dates; the resume lists one,
`Evals and Automation Intern, Jan 2025 - Present`. Merged both the terminal entry and the two
corpus chunks, and reindexed. Left the location and the SUNY entry diverging from the resume,
recorded in `SPEC/TECH/03-content-and-corpus.md`.

**Terminal green.** Swapped the cyan accent for green, then darkened it a step to `green-500`.
Folded the emerald tool tags and the amber section headings into the same green, so the whole
terminal is one colour plus red for errors.

**Typewriter skip.** Tried line-by-line reveal instead of character-by-character; it was faster
and lost the effect, so it was reverted in favour of keeping the typing and making it skippable
([ADR-0007](SPEC/decisions/0007-skip-the-typewriter-rather-than-remove-it.md)).

Then a self-inflicted bug: clicking a command-bar button skipped its own animation. The
container's skip handler computed its watermark *after* the button's handler had already taken
the next entry id, so the new entry was at or below the watermark. Fixed with `stopPropagation`
on the buttons. Verified in the browser: 5,468 characters mid-typing with a caret, then a click,
then the full 10,627 with no caret. [Pitfall 3](SPEC/TECH/07-engineering-pitfalls.md).

Keyboard skip was added afterwards and needed no equivalent guard, because keydown fires before
the form submits.

**The badge fire.** Several rounds. A particle system read as fireflies rather than fire, so it
was replaced with a noise-based flame shader. That first blew out to a solid white-green mass
with visible straight edges: three additive sheets each carrying a white-hot tier, and a flame
whose threshold was still above zero at the plane's top edge, so the geometry cut it square
([pitfall 9](SPEC/TECH/07-engineering-pitfalls.md)).

The "black box cutting the fire" report was the card itself: flames were dying level with its top
edge, so the black rectangle read as a hole punched through them. Fixed by raising the tongues
clear of the top, strengthening the front sheet, and giving the card a faint emissive.

A pixel-ember variant was built and liked, then dropped along with the whole first version when
the owner reverted; the final effect is engulfing, restrained, and has no particles. The pixel
trick is kept in [pitfall 10](SPEC/TECH/07-engineering-pitfalls.md) because it is worth knowing:
a point sprite is a square quad, so removing the radial mask gives a hard-edged pixel for free.

React's purity lint rejected `Math.random()` inside the `useMemo` that generated particle
positions, which was correct and led to a seeded mulberry32
([pitfall 4](SPEC/TECH/07-engineering-pitfalls.md)).

---

## Earlier

Predates this file. The repo's own history is the record: the RAG pipeline replacing a static
system prompt, the guardrails and rate limiting, the 3D badge and its two crash modes, and the
corpus being enriched from project READMEs. The crash modes are written up in
[`SPEC/TECH/05-badge-scene.md`](SPEC/TECH/05-badge-scene.md) and as pitfalls 5 through 7, because
both were rediscovered rather than remembered.
