import { PrismaClient } from "@prisma/client/extension";
import { Decimal } from "@prisma/client/runtime/wasm-compiler-edge";


const prisma = new PrismaClient();

export async function saveItinerary(
  data: any,
  contextBlob: string,
  embedding: number[],
) {
  // Step 1: Save itinerary + days in a transaction
  const itinerary = await prisma.itinerary.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      summary: data.summary,
      durationDays: data.durationDays,
      durationNights: data.durationNights,
      priceFrom: data.priceFrom ? new Decimal(data.priceFrom) : null,
      tourType: data.tourType,
      accommodationType: data.accommodationType ?? null,
      destinations: data.destinations,
      activities: data.activities,
      highlights: data.highlights,
      includes: data.includes,
      excludes: data.excludes,
      wildlife: data.wildlife,
      coverImage: data.coverImage ?? null,
      sourceUrl: data.sourceUrl ?? null,
      sourceName: data.sourceName ?? null,
      isFeatured: false,
      isPublished: true,
      days: {
        create: data.days.map((day: any) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          destination: day.destination ?? null,
          accommodation: day.accommodation ?? null,
          mealPlan: day.mealPlan ?? null,
          imageUrl: day.imageUrl ?? null,
        })),
      },
    },
    include: { days: true },
  });

  // Step 2: Save context blob
  await prisma.itineraryEmbedding.create({
    data: {
      itineraryId: itinerary.id,
      contextBlob,
    },
  });

  // Step 3: Save vector via raw SQL (pgvector)
  await prisma.$executeRawUnsafe(
    `UPDATE "ItineraryEmbedding" SET embedding = $1::vector WHERE "itineraryId" = $2`,
    `[${embedding.join(",")}]`,
    itinerary.id,
  );

  return itinerary;
}
