-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('SAFARI', 'CLIMBING', 'CULTURAL', 'BEACH', 'ADVENTURE', 'WILDLIFE', 'COMBINED');

-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('LODGE', 'TENTED_CAMP', 'HOTEL', 'COTTAGE', 'MIXED');

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "durationDays" INTEGER NOT NULL,
    "durationNights" INTEGER NOT NULL,
    "priceFrom" DECIMAL(10,2),
    "tourType" "TourType" NOT NULL,
    "accommodationType" "AccommodationType",
    "destinations" TEXT[],
    "activities" TEXT[],
    "highlights" TEXT[],
    "includes" TEXT[],
    "excludes" TEXT[],
    "wildlife" TEXT[],
    "coverImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "destination" TEXT,
    "accommodation" TEXT,
    "mealPlan" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryEmbedding" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "contextBlob" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_slug_key" ON "Itinerary"("slug");

-- CreateIndex
CREATE INDEX "Itinerary_isPublished_idx" ON "Itinerary"("isPublished");

-- CreateIndex
CREATE INDEX "Itinerary_durationDays_idx" ON "Itinerary"("durationDays");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryDay_itineraryId_dayNumber_key" ON "ItineraryDay"("itineraryId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryEmbedding_itineraryId_key" ON "ItineraryEmbedding"("itineraryId");

-- AddForeignKey
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryEmbedding" ADD CONSTRAINT "ItineraryEmbedding_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
