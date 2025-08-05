-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('Birthday', 'Wedding', 'Party', 'Get_together');

-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('image', 'docs', 'link');

-- CreateEnum
CREATE TYPE "public"."userRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'HOST');

-- CreateTable
CREATE TABLE "public"."event" (
    "id" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "eventImage" TEXT NOT NULL,
    "shortOverview" TEXT NOT NULL,
    "overViewImage" TEXT[],
    "tags" TEXT[],
    "eventType" "public"."EventType" NOT NULL,
    "extraText" TEXT[],
    "location" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "userName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."userRole" NOT NULL DEFAULT 'USER',
    "name" TEXT,
    "images" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "phoneNo" TEXT,
    "provider" TEXT,
    "providerId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "isPopular" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "event_id_key" ON "public"."event"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."event" ADD CONSTRAINT "event_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
