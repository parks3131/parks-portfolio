import OpenAI from "openai";
import { getPool } from "@/lib/db";

const EMBEDDING_MODEL = "text-embedding-3-small";
const TOP_K = 6;

let openaiClient: OpenAI | undefined;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export type RetrievedChunk = {
  id: string;
  source: string;
  title: string;
  content: string;
};

export async function retrieveContext(query: string): Promise<RetrievedChunk[]> {
  const openai = getOpenAI();
  const embeddingRes = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });
  const vectorLiteral = `[${embeddingRes.data[0].embedding.join(",")}]`;

  const pool = getPool();
  const result = await pool.query<RetrievedChunk>(
    `SELECT id, source, title, content
     FROM chunks
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [vectorLiteral, TOP_K],
  );

  return result.rows;
}
