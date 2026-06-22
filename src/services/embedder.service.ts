import { VoyageAIClient } from "voyageai";

const voyage = new VoyageAIClient({ apiKey: Bun.env.VOYAGE_API_KEY as string });

export function buildContextBlob(data: any): string {
  return `
Title: ${data.title}
Duration: ${data.durationDays} Days / ${data.durationNights} Nights
Tour Type: ${data.tourType}

Overview:
${data.description}

Destinations:
${data.destinations.join(", ")}

Activities:
${data.activities.join(", ")}

Wildlife:
${data.wildlife.join(", ")}

Highlights:
${data.highlights.join(", ")}

Included:
${data.includes.join(", ")}

Keywords:
${data.destinations.join(", ")}, ${data.activities.join(", ")}, ${data.tourType}, Tanzania safari, Africa wildlife
`.trim();
}

export async function generateEmbedding(
  contextBlob: string,
): Promise<number[]> {
  const response = await voyage.embed({
    input: contextBlob,
    model: "voyage-3",
  });

  if (!response.data || response.data.length === 0) {
    throw new Error("No embedding returned from Voyage AI");
  }

  return response.data[0].embedding as number[];
}
