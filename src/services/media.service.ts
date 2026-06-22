import path from "path";


const MEDIA_BASE_URL = Bun.env.MEDIA_BASE_URL as string;
const MEDIA_PATH = Bun.env.MEDIA_PATH as string;

async function downloadImage(
  imageUrl: string,
  filename: string,
): Promise<string> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${imageUrl}`);
  }

  const ext = path.extname(new URL(imageUrl).pathname) || ".webp";
  const sanitizedFilename = `${filename}${ext}`;
  const filePath = path.join(MEDIA_PATH, sanitizedFilename);

  const buffer = await response.arrayBuffer();
  await Bun.write(filePath, buffer);

  return `${MEDIA_BASE_URL}/${sanitizedFilename}`;
}

export async function processImages(extracted: any): Promise<any> {
  const slug = extracted.slug;

  // Download cover image
  if (extracted.coverImage) {
    try {
      extracted.coverImage = await downloadImage(
        extracted.coverImage,
        `${slug}-cover`,
      );
    } catch (e) {
      console.error("Failed to download cover image:", e);
    }
  }

  // Download day images
  for (const day of extracted.days) {
    if (day.imageUrl) {
      try {
        day.imageUrl = await downloadImage(
          day.imageUrl,
          `${slug}-day-${day.dayNumber}`,
        );
      } catch (e) {
        console.error(`Failed to download day ${day.dayNumber} image:`, e);
      }
    }
  }

  return extracted;
}
