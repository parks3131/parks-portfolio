# ADR-0002: Retrieve per question instead of stuffing one static system prompt

| | |
|---|---|
| Status | Accepted |
| Date | 2026-07-31 |
| Deciders | parks3131 |
| Supersedes | none |

Recorded after the fact. The change shipped before this tree existed; this ADR captures the
reasoning so it is not reversed as "unnecessary complexity for a portfolio".

## Context

The first version built one system prompt from `content.ts` and sent the whole thing on every
request. It worked, and for a resume-sized dataset it was the right starting point.

It stops working the moment the material grows past a resume. The interesting content here is
project write-ups: why a decision was made, what broke, what the alternative was. That is
thousands of words per project, it is the material that actually differentiates the site, and
none of it fits in a prompt sent on every request.

## Decision

We will chunk the material into a corpus, embed it, store it in Postgres with pgvector, and
retrieve the top k chunks per question, injecting only those into the prompt.

## Consequences

| | |
|---|---|
| Positive | The corpus grows without changing per-request cost. Answers cite material that would never fit in a static prompt. The site gains a genuine work sample: the RAG pipeline is itself one of the listed projects, and its own architecture is in the corpus, so it can explain itself. |
| Negative | Two more services to keep alive (Neon, OpenAI embeddings), an embedding call on the hot path, and a second source of resume truth. A question whose material is not retrieved is answered worse than it would have been by the static prompt, which had everything. |
| Follow-up needed | A similarity floor, so "nothing relevant matched" is distinguishable from "here are six weak chunks". Recorded as an open question. |

## Alternatives considered

| Alternative | Why not |
|---|---|
| Keep the static prompt, just make it bigger | Per-request cost scales with total content, and the content that makes this site worth reading is the part that does not fit. Also caps the corpus at the context window forever. |
| Keyword search over the chunks, no embeddings | A visitor asks "how do you handle things going wrong", the chunk says "graceful degradation". Lexical search misses exactly the paraphrase-heavy questions this is for. |
| A vector store as a service (Pinecone and similar) | Another vendor and another bill for a few dozen chunks. Postgres was going to be in the stack regardless, and pgvector at this size is a sequential scan that is fast enough. |
| Fine-tune a model on the material | Absurd at this scale, impossible to update, and it would confidently hallucinate in exactly the register that is most damaging - first person, about a real person's employment. |
