import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { retrieveContext } from "@/lib/retrieve";
import { checkInput, checkOutput } from "@/lib/guardrails";
import { getRateLimiter } from "@/lib/rateLimit";

export const runtime = "nodejs";

type ChatRequestBody = {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is not configured. Missing OPENROUTER_API_KEY." },
      { status: 500 },
    );
  }

  const ip = getClientIp(req);
  try {
    const { success } = await getRateLimiter().limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many messages. Wait a moment and try again." },
        { status: 429 },
      );
    }
  } catch (err) {
    console.error("Rate limiter error:", err);
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const inputCheck = checkInput(message);
  if (!inputCheck.allowed) {
    return NextResponse.json({ reply: inputCheck.reason });
  }

  const history = (body.history ?? []).slice(-10);

  try {
    const context = await retrieveContext(message);

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://parkstechusa.com",
        "X-Title": "Parks RPK Portfolio Terminal",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt(context) },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter error:", res.status, errText);
      return NextResponse.json(
        { error: "The AI backend returned an error. Try again in a moment." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: "No response from the model." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: checkOutput(reply) });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Failed to reach the AI backend." },
      { status: 500 },
    );
  }
}
