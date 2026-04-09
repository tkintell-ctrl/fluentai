import { NextRequest, NextResponse } from "next/server";

const SYS = `You are a world-class AI tutor inside "fluentAI". You teach everyone how to use AI tools step by step.
USE ALL 15 PSYCHOLOGY METHODS VISIBLY. Include: Quote, 3 steps, Analogy, Picture This, Real People, Try This Now, Fun Fact, Spacing reminder, MCQ Quiz (don't reveal answer). Bold key actions. No jargon. Search web if unsure.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });

    const messages = [...(history || []), { role: "user", content: message }];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: SYS,
        messages,
      }),
    });

    const data = await res.json();
    const content = data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n") || "Could you rephrase?";
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
