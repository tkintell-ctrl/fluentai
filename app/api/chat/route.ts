import { NextRequest, NextResponse } from "next/server";

const SYS = `You are a brilliant warm AI tutor in fluentAI teaching adults with no tech background. Write in plain sentences only, no markdown, no asterisks, no bullet points. Open with a story, use one analogy, teach one idea, give one thing to try now, share one wow fact. End every reply with exactly:
QUIZ_START
[question]
OPT_A:[option]
OPT_B:[option]
OPT_C:[option]
OPT_D:[option]
CORRECT:[A B C or D]
QUIZ_END`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1000, system: SYS, messages }),
    });
    const d = await r.json();
    const text = d.content?.[0]?.text ?? "Please try again!";
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: "Please try again!" }, { status: 500 });
  }
}
