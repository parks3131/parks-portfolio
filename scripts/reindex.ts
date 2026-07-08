import path from "node:path";
import { readFile } from "node:fs/promises";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type Chunk = {
  id: string;
  source: string;
  title: string;
  content: string;
};

const EMBEDDING_MODEL = "text-embedding-3-small";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL in .env.local");
  if (!openaiApiKey) throw new Error("Missing OPENAI_API_KEY in .env.local");

  const corpusPath = path.resolve(process.cwd(), "data/corpus.json");
  const chunks: Chunk[] = JSON.parse(await readFile(corpusPath, "utf-8"));

  const openai = new OpenAI({ apiKey: openaiApiKey });
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536)
      );
    `);

    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS chunks_embedding_idx
        ON chunks USING hnsw (embedding vector_cosine_ops);
      `);
    } catch (err) {
      console.warn("Skipping HNSW index (not critical at this corpus size):", (err as Error).message);
    }

    console.log(`Embedding ${chunks.length} chunks with ${EMBEDDING_MODEL}...`);

    const seenIds = new Set<string>();
    for (const chunk of chunks) {
      if (seenIds.has(chunk.id)) {
        throw new Error(`Duplicate chunk id in corpus.json: ${chunk.id}`);
      }
      seenIds.add(chunk.id);

      const embeddingRes = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: chunk.content,
      });
      const embedding = embeddingRes.data[0].embedding;
      const vectorLiteral = `[${embedding.join(",")}]`;

      await pool.query(
        `INSERT INTO chunks (id, source, title, content, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)
         ON CONFLICT (id) DO UPDATE SET
           source = EXCLUDED.source,
           title = EXCLUDED.title,
           content = EXCLUDED.content,
           embedding = EXCLUDED.embedding`,
        [chunk.id, chunk.source, chunk.title, chunk.content, vectorLiteral],
      );
      console.log(`  ✓ ${chunk.id}`);
    }

    const deleteRes = await pool.query(
      `DELETE FROM chunks WHERE id != ALL($1::text[]) RETURNING id`,
      [[...seenIds]],
    );
    if (deleteRes.rowCount) {
      console.log(`Removed ${deleteRes.rowCount} stale chunk(s) no longer in corpus.json.`);
    }

    console.log("Done.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
