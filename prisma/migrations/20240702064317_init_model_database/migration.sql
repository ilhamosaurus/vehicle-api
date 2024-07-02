/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "vehicle_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,

    CONSTRAINT "vehicle_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,

    CONSTRAINT "vehicle_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_year" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,

    CONSTRAINT "vehicle_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricelists" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "model_id" TEXT NOT NULL,
    "year_id" TEXT NOT NULL,

    CONSTRAINT "pricelists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pricelists_code_key" ON "pricelists"("code");

-- AddForeignKey
ALTER TABLE "vehicle_type" ADD CONSTRAINT "vehicle_type_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_model" ADD CONSTRAINT "vehicle_model_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "vehicle_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricelists" ADD CONSTRAINT "pricelists_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "vehicle_model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricelists" ADD CONSTRAINT "pricelists_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "vehicle_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;
