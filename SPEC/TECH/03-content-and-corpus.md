# Content and corpus

## The two sources

| Source | Drives | Shape |
|---|---|---|
| `src/lib/content.ts` | Every static terminal command | Typed structures: profile, about, skills, projects, experience, education, certifications, leadership |
| `data/corpus.json` | Everything the chatbot knows | Flat array of `{ id, source, title, content }` |

They overlap heavily and are maintained separately. That is a decision, not an accident
([ADR-0003](../decisions/0003-two-sources-of-resume-truth.md)), and it is the single most
reliable way to ship a wrong claim in this repo: the terminal and the chatbot answering the same
question differently.

A third source exists and is easy to forget: **`public/Parks_RPK_Resume.pdf`**. A visitor can
download it and compare.

## The reindex contract

`npm run reindex`:

1. Creates the `vector` extension and the `chunks` table if absent.
2. Creates the HNSW index if it can; warns and continues if it cannot.
3. Rejects the file if two chunks share an `id`.
4. Embeds every chunk and upserts by `id`.
5. **Deletes every row whose `id` is not in the file**, and reports the count.

Step 5 is the dangerous one. It is what makes the file authoritative rather than additive, which
is correct, and it also means running the script against a half-written file destroys chunks
with no undo. There is one index and it is production.

Renaming a chunk's `id` is therefore a delete plus an insert, not a rename, and it costs a
re-embed of that chunk.

## Keeping them honest

Any change to a resume fact is a change to all of the sources that carry it. The checklist is at
[`../templates/corpus-change-checklist.md`](../templates/corpus-change-checklist.md).

The tell that they have drifted is that `projects` and a question about the same project
disagree. Nothing catches this automatically today.

## Known divergences

Recorded rather than hidden, because they are live:

- The resume PDF says **Arlington, VA**; `content.ts` says **Binghamton, NY**.
- The resume PDF lists **one** Acarin role and no SUNY Research Foundation; `content.ts` lists
  the merged Acarin role **and** SUNY.

Both are open questions in
[`../PRD/04-roadmap-and-open-questions.md`](../PRD/04-roadmap-and-open-questions.md).
