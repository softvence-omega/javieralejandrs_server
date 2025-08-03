-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('image', 'docs', 'link');

-- CreateEnum
CREATE TYPE "public"."userRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'HOST');

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
    "isPopular" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
