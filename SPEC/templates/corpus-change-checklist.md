# Corpus change checklist

Use for any change to `data/corpus.json`, or to any fact about Parks anywhere in the repo.
**Every item here has drifted or broken once.**

<!-- Copy into the PR or the commit body and tick through it. -->

## Before editing

- [ ] Read `SPEC/TECH/03-content-and-corpus.md`. There are **three** sources of resume truth:
      `src/lib/content.ts`, `data/corpus.json`, and `public/Parks_RPK_Resume.pdf`.
- [ ] Confirm the fact itself with the owner if it is a date, a title, an employer or a metric.
      These are not derivable by analogy and the three sources have disagreed before.

## Writing the chunk

- [ ] The chunk is **self-contained**. It will be retrieved alone, without its neighbours.
- [ ] The `title` describes the chunk on its own; it is rendered as the heading the model sees.
- [ ] The chunk covers **one** topic. Two topics in one chunk match both weakly.
- [ ] The `id` is stable. Renaming an id is a delete plus a re-embed, not a rename.
- [ ] No id collides with an existing one. `reindex` will refuse the file, but check first.
- [ ] No em dash (`grep -n $'\u2014' data/corpus.json`). See `AGENTS.md` standing
      instruction 1.

## Keeping the sources honest

- [ ] If the fact also appears in the terminal, `src/lib/content.ts` is updated in the **same
      change**.
- [ ] If the resume PDF also states it, either the PDF is replaced or the divergence is recorded
      in `SPEC/TECH/03-content-and-corpus.md` under "Known divergences".
- [ ] If a project's stack or story changed, **every** chunk about that project is checked, not
      just the one being edited. A rebuilt project has stale chunks describing the old
      architecture - this is exactly how pitfall 2 shipped.

## Reindexing

- [ ] Read the diff of `data/corpus.json` before running anything.
- [ ] Understand that `npm run reindex` **writes to production and deletes every row whose id is
      absent from the file.** There is one index and no staging copy.
- [ ] Run `npm run reindex`.
- [ ] Read its output: the upserted ids, and the count of stale chunks removed. **If the removal
      count is not what you expected, stop and investigate** - it means ids moved.

## Verifying

- [ ] Ask the running endpoint a question that should hit the changed chunk, and read the answer.
      Confirm the **new** text comes back, not the old.
- [ ] Ask a question that should hit a *neighbouring* chunk, to confirm nothing else was
      displaced.
- [ ] Run the same question through the terminal's static command, and confirm the two surfaces
      agree.

## Finishing

- [ ] `npx tsc --noEmit` and `npx eslint src` clean.
- [ ] `SPEC/` updated in the same change if any documented behaviour moved.
- [ ] Narrative appended to `HISTORY.md`.
