# Retrieval

## What happens

1. The question is embedded with `text-embedding-3-small`, 1536 dimensions.
2. The vector is formatted as a Postgres vector literal and used directly in the query.
3. `ORDER BY embedding <=> $1::vector LIMIT 6` returns the six nearest chunks by cosine distance.
4. Those chunks are formatted into the prompt as `### <title>` followed by the content.

One embedding call and one query per question. No re-ranking, no query expansion, no hybrid
search.

## The chunks table

| Column | Notes |
|---|---|
| `id` | Text primary key. **Comes from the corpus file**, not generated - this is what makes reindex an upsert rather than a rebuild |
| `source` | A tag like `resume` or `project:ClubChat`. Not currently used for filtering |
| `title` | Rendered into the prompt as the chunk heading |
| `content` | The passage |
| `embedding` | `vector(1536)`, HNSW index with `vector_cosine_ops` |

The HNSW index creation is wrapped in a try/catch: at this corpus size a sequential scan is
fine, so a `pgvector` build that does not support it is a warning rather than a failure.

## Chunking rules

Chunks are written by hand, not split by a tokenizer. Each one must be:

- **Self-contained.** It will be retrieved alone, without its neighbours, so a chunk that starts
  "This also means..." is useless.
- **Named by its title.** The title is what the model sees as the heading, so it does real work.
- **About one thing.** A chunk covering two topics matches both weakly and neither well.

Roughly 400 to 2,700 characters each in practice. Longer chunks dilute the embedding; shorter
ones lose the context that makes them answerable.

## Why `TOP_K` is 6

Six chunks at this size is a few thousand tokens of context, which is generous for a 500-token
answer. Raising it is the wrong reflex when an answer is bad: a question that does not find its
material in six chunks usually needs a better chunk, not more of them.
See [`AGENTS.md`](../../AGENTS.md) section 2.2.

## What must not break

- **The embedding model must match between `scripts/reindex.ts` and `src/lib/retrieve.ts`.**
  They both name it independently. Two different models produce vectors in incomparable spaces,
  and the failure mode is silent: every query returns *something*, just nothing relevant.
- **The dimension in the schema (`vector(1536)`) must match the model.** Changing the model
  almost certainly means a new migration and a full re-embed.
