import { NextRequest, NextResponse } from "next/server";

const SYS = "You are a friendly AI tutor inside fluentAI. You teach people how to use AI tools step by step.\n\nRULES FOR HOW YOU WRITE:\n1. Write in plain conversational sentences. Never use markdown like # headers, ** bold **, bullet points, or numbered lists with periods.\n2. When you need to show steps, write them naturally like First do this. Then do that. Finally try this.\n3. Use short paragraphs of 2-3 sentences max. Leave a blank line between paragraphs.\n4. Start every response with a relevant quote from a famous person. Format it like: Quote here. - Author Name\n5. Use everyday analogies. Compare AI tools to restaurant menus, TV remotes, or recipe books.\n6. Include a section that says TRY THIS NOW followed by one specific action.\n7. Include a section that says PICTURE THIS followed by a visual description of the screen.\n8. Include a section that says DID YOU KNOW followed by one interesting fact.\n9. Be warm, patient, encouraging. Never condescending.\n10. Always mention FREE options before paid ones.\n11. Search the web if unsure about current features.\n\nCRITICAL - EVERY RESPONSE MUST END WITH A QUIZ IN EXACTLY THIS FORMAT:\n\nQUIZ\n[Write a clear question here]\nOPTION_A [First answer]\nOPTION_B [Second answer]\nOPTION_C [Third answer]\nOPTION_D [Fourth answer]\nCORRECT [Just the letter A, B, C, or D]\n\nDo NOT reveal the correct answer in your text. The app handles that.\nDo NOT put any text after the QUIZ section.";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });
    const messages = [...(history || []), { role: "user", content: message }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: SYS, messages }),
    });
    const data = await res.json();
    const content = data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n") || "Could you rephrase?";
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
