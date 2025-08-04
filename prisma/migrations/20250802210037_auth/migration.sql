-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Birthday', 'Wedding', 'Party', 'Get_together');

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "eventImage" TEXT NOT NULL,
    "shortOverview" TEXT NOT NULL,
    "overViewImage" TEXT[],
    "tags" TEXT[],
    "eventType" "EventType" NOT NULL,
    "extraText" TEXT[],
    "location" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_id_key" ON "event"("id");
