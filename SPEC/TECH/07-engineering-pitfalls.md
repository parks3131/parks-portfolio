# Engineering pitfalls

Add an entry every time a bug costs more than an hour, or would have if it had been noticed
later. Include the symptom, the root cause, and the rule that prevents it. **An entry that only
records the fix is worth half as much as one that records how to recognise the class.**

---

1. **A check that pattern-matches another file's output goes silently dead when that file
   changes.** Symptom: none, twice, for months. `checkOutput` looked for the plain-text section
   headers the system prompt used to have (`CONTEXT:`, `Style rules:`, `CONTACT:`) and required
   two of them. The prompt was later rewritten into XML-ish section tags, so the real prompt
   matched exactly one marker, `### `, and **a full system-prompt leak would have been passed
   straight to the visitor.** Root cause: the guard and the thing it guards live in different
   files with no compile-time link, so the guard kept reporting success against an artifact that
   no longer existed. **Rule: a guard that pattern-matches another module's output must be fed
   that module's actual current output and watched to refuse.** Not read, not reasoned about -
   run. How to recognise the class: the check is a string or regex match against text produced
   elsewhere, and nothing in the type system connects them. Note the direction it fails: it does
   not error, it approves. This shipped **twice** - once when the prompt moved to a `CONTEXT:`
   format, and again when it moved to tags - which is why
   [ADR-0005](../decisions/0005-output-guardrail-keys-on-prompt-structure.md) exists and why
   non-negotiable 6 in [`AGENTS.md`](../../AGENTS.md) is phrased as "proved, not reasoned about".

2. **Two sources of the same fact do not drift loudly. They drift silently, and each stays
   internally consistent.** Symptom: `projects` in the terminal described ClubChat's current
   Fastify and Postgres rebuild, while asking the chatbot about ClubChat produced a confident,
   detailed answer about the retired Supabase and row-level-security version, including a bug
   story that no longer applied. Root cause: `content.ts` was updated and `data/corpus.json` was
   not. Both files were individually coherent, so there was no type error, no failing build, and
   nothing visually wrong on either surface alone. **Rule: a change to a resume fact touches
   `content.ts`, `data/corpus.json`, `public/Parks_RPK_Resume.pdf` and a reindex, or it touches
   none of them.** How to recognise the class: ask the same question two different ways, through
   two different surfaces, and compare. Nothing else finds it.

3. **A container's click handler fires for clicks its own children raised, after the child has
   already acted.** Symptom: clicking `projects` in the command bar rendered the entire output
   instantly instead of animating, while typing `projects` and pressing Enter animated correctly.
   Root cause: the click-to-skip handler on the terminal container computed its watermark from
   the current entry id, but the button's own handler had already run `runCommand` and taken the
   next id. The new entry was therefore at or below the watermark and was revealed immediately.
   **Rule: a child whose action creates the object the parent's handler operates on must stop
   propagation.** How to recognise the class: the parent handler reads state that the child
   handler just mutated. Note that the keyboard path is fine without any special handling,
   because keydown fires *before* the form's submit, which is the opposite ordering.

4. **`Math.random()` during render is a lint error here, and the lint rule is right.** Symptom:
   `react-hooks/purity` failed the build on particle positions generated inside a `useMemo`.
   Root cause: `useMemo` runs during render, and an impure value there produces a different
   result on any re-render, which for a particle system means the whole effect silently
   reshuffles. **Rule: generate anything positional from a seeded PRNG (mulberry32 is four
   lines), not from `Math.random()`.** The determinism is worth having on its own: the same
   scene renders identically every time, which makes a visual regression meaningful.

5. **A joint pivot offset between two nearly-coincident bodies destroys the WebGL context.**
   Symptom: the whole canvas went black and the page needed a reload; no exception in the
   console. Root cause: the card's spherical joint was given a nonzero pivot while the card body
   started almost coincident with the last chain link. That is a large initial constraint error;
   the solver closes it over the first few steps, velocities go to NaN or Infinity, and the
   corrupted buffer takes the context down. **Rule: both pivots are zero, and any visual offset
   is applied inside the rigid body where it does not enter joint math.** How to recognise the
   class: a crash with no stack, immediately on mount, in a physics scene.

6. **Non-finite geometry corrupts the buffer, and one bad frame is enough.** Symptom: same as
   entry 5, but triggered by throwing the badge hard rather than at mount. Root cause: a single
   frame of non-finite body position written into the meshline. **Rule: check `Number.isFinite`
   on every component of every curve point before setting geometry.** A guard costs four
   comparisons a frame; the failure costs the tab, including the terminal, which is the part of
   the page that actually matters.

7. **Solid colliders on bodies that exist only to define a shape produce permanent jitter.**
   Symptom: the badge never settled, twitching indefinitely. Root cause: the three chain links
   had solid ball colliders and were self-contacting. Nothing else is in the scene for them to
   hit. **Rule: colliders that exist for joint structure rather than for collision are sensors.**

8. **`reindex` is authoritative, not additive, and there is one index and it is production.**
   The script deletes every row whose `id` is absent from the file. Running it against a
   half-edited or truncated corpus destroys chunks with no undo and no staging copy to restore
   from. **Rule: read the diff of `data/corpus.json` before running it, and treat a chunk `id`
   as a primary key rather than a label** - renaming one is a delete plus a re-embed, not a
   rename.

9. **Additive blending stacks, and three plausible layers make an opaque white mass.** Symptom:
   a green flame effect rendered as a solid white-green blob with visible straight edges where
   the quad was clipped. Root cause: three additive sheets each with a white-hot tier in the
   colour ramp; individually reasonable, summed they saturate every channel. The straight edges
   were the second half: the flame's noise threshold was still above zero at the plane's top
   edge, so the geometry cut the flame square. **Rules: with additive layers, budget total
   opacity across the stack rather than per layer, and force a procedural effect to zero before
   its own geometry boundary.** How to recognise the class: an effect looks correct at one layer
   and wrong at three, and the wrongness is uniform rather than patchy.

10. **A point sprite is a square quad, so a "particle" is square unless you make it round.**
    Useful in both directions: a radial mask in the fragment shader gives a soft round spark,
    and *removing* it gives a hard-edged pixel for free. Worth knowing before writing a texture.

11. **The embedding model is named independently in two files and they must agree.** Symptom:
    none yet. `scripts/reindex.ts` and `src/lib/retrieve.ts` each declare
    `text-embedding-3-small` as their own constant. If one changes, every query still returns six
    chunks, ranked by distances computed in incomparable spaces, so answers get subtly worse with
    no error anywhere. **Rule: changing the embedding model means changing both files, the
    `vector(1536)` column, and re-embedding everything, as one change.** How to recognise the
    class: a constant duplicated across a producer and a consumer that never import each other.
