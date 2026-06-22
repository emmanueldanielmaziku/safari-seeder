import Anthropic from "@anthropic-ai/sdk";

type AIProvider = "anthropic" | "deepseek";

const EXTRACTION_PROMPT = `You are a tour itinerary data extractor. Extract structured data from the provided markdown content of a tour itinerary page.

IMPORTANT: Never mention the source company name, brand, or operator in any titles, descriptions, summaries, or day descriptions. All content should be written neutrally as if describing the itinerary independently.

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. Just raw JSON.

The JSON must match this exact structure:
{
  "title": "string",
  "slug": "string (url-friendly, lowercase, hyphens)",
  "description": "string (main overview paragraph, no brand names)",
  "summary": "string (1-2 sentence summary, no brand names)",
  "durationDays": number,
  "durationNights": number,
  "priceFrom": number or null,
  "tourType": "SAFARI | CLIMBING | CULTURAL | BEACH | ADVENTURE | WILDLIFE | COMBINED",
  "accommodationType": "LODGE | TENTED_CAMP | HOTEL | COTTAGE | MIXED | null",
  "destinations": ["string"],
  "activities": ["string"],
  "highlights": ["string"],
  "includes": ["string"],
  "excludes": ["string"],
  "wildlife": ["string"],
  "coverImage": "string or null",
  "sourceUrl": "string or null",
  "sourceName": "string or null",
  "days": [
    {
      "dayNumber": number,
      "title": "string",
      "description": "string (no brand names)",
      "destination": "string or null",
      "accommodation": "string or null",
      "mealPlan": "string or null",
      "imageUrl": "string or null"
    }
  ]
}`;

async function extractWithAnthropic(prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: Bun.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function extractWithDeepseek(prompt: string): Promise<string> {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Bun.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content ?? "";
}

function parseJSON(text: string) {
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${text}`);
  }
}

export async function extractItinerary(
  markdown: string,
  metadata: any,
  provider: AIProvider = "anthropic",
) {
  const prompt = `${EXTRACTION_PROMPT}\n\nMetadata:\n${JSON.stringify(metadata, null, 2)}\n\nMarkdown Content:\n${markdown}`;

  const text =
    provider === "deepseek"
      ? await extractWithDeepseek(prompt)
      : await extractWithAnthropic(prompt);

  return parseJSON(text);
}
