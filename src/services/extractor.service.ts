import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: Bun.env.ANTHROPIC_API_KEY,
});

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

export async function extractItinerary(markdown: string, metadata: any) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `${EXTRACTION_PROMPT}\n\nMetadata:\n${JSON.stringify(metadata, null, 2)}\n\nMarkdown Content:\n${markdown}`,
      },
    ],
  });

const text =
  response.content[0].type === "text" ? response.content[0].text : "";

try {
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(clean);
} catch {
  throw new Error(`Failed to parse Claude response as JSON: ${text}`);
}
}
