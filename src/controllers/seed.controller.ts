import { Context } from "hono";
import { extractItinerary } from "../services/extractor.service";
import {
  buildContextBlob,
  generateEmbedding,
} from "../services/embedder.service";
import { processImages } from "../services/media.service";
import { saveItinerary } from "../services/db.service";

export async function seedEngine(c: Context) {
const { url, format = "markdown", provider = "deepseek" } = await c.req.json();

  if (!url) {
    return c.json({ error: "URL is required" }, 400);
  }

  // Step 1: Scrape
  const scrapeResponse = await fetch(`${Bun.env.WEBCLAW_BASE_URL}/v1/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format }),
  });

  if (!scrapeResponse.ok) {
    return c.json(
      { error: "Scraping failed", status: scrapeResponse.status },
      500,
    );
  }

  const { markdown, metadata } = await scrapeResponse.json();

  // Step 2: Extract structured data
 const extracted = await extractItinerary(markdown, metadata, provider);

  // Step 3: Download & rehost images
  const processed = await processImages(extracted);

  // Step 4: Build context blob + generate embedding
  const contextBlob = buildContextBlob(processed);
  const embedding = await generateEmbedding(contextBlob);

  // Step 5: Save to database
  const saved = await saveItinerary(processed, contextBlob, embedding);

  console.log("Saved itinerary ID:", saved.id);

  return c.json({ success: true, id: saved.id, title: saved.title });
}
