import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { images, brewMethod, systemPrompt, feedbackContext } = await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const messages: Array<{ role: string; content: unknown }> = [];

  if (feedbackContext) {
    // Feedback mode: text-only
    messages.push({
      role: "user",
      content: feedbackContext,
    });
  } else {
    // Scan mode: images + text
    const content: Array<{ type: string; [key: string]: unknown }> = [];

    for (const img of images) {
      content.push({
        type: "image_url",
        image_url: { url: img },
      });
    }

    content.push({
      type: "text",
      text: "Analyze this coffee package and provide brewing recommendations.",
    });

    messages.push({ role: "user", content });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Invalid JSON from AI", raw: text }, { status: 500 });
  }
}
