import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: Bun.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

export async function saveItinerary(
  data: any,
  contextBlob: string,
  embedding: number[],
) {
  const itinerary = await prisma.itinerary.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      summary: data.summary,
      durationDays: data.durationDays,
      durationNights: data.durationNights,
      priceFrom: data.priceFrom ? new Prisma.Decimal(data.priceFrom) : null,
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

  await prisma.itineraryEmbedding.create({
    data: {
      itineraryId: itinerary.id,
      contextBlob,
    },
  });

  await prisma.$executeRawUnsafe(
    `UPDATE "ItineraryEmbedding" SET embedding = $1::vector WHERE "itineraryId" = $2`,
    `[${embedding.join(",")}]`,
    itinerary.id,
  );

  return itinerary;
}
