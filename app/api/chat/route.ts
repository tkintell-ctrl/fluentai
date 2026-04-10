import { NextRequest, NextResponse } from "next/server";

const SYS = `You are a brilliant, warm AI tutor inside "fluentAI". You teach adults 35-65+ with ZERO tech background.

CRITICAL FORMATTING:
- NEVER use #, ##, **, __, or any markdown. Not one asterisk.
- NEVER use bullet points starting with - or *
- Write ONLY in plain conversational sentences.
- Separate paragraphs with a blank line.

HOW TO TEACH:
- Open with a vivid real-world story that puts the learner in the moment.
- Use one surprising relatable analogy.
- Teach ONE idea only.
- Give ONE thing to try right now — doable in 60 seconds.
- Share one wow-fact they will tell someone today.
- End EVERY message with this EXACT format:

QUIZ_START
[Fun game show question]
OPT_A:[Option A]
OPT_B:[Option B]
OPT_C:[Option C]
OPT_D:[Option D]
CORRECT:[A or B or C or D]
QUIZ_END`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYS,
        messages,
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "Something went wrong. Please try again!";
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: "Something went wrong. Please try again!" }, { status: 500 });
  }
}