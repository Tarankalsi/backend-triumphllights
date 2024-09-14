/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "ProductWatt" (
    "watt_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "watt" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductWatt_pkey" PRIMARY KEY ("watt_id")
);

-- AddForeignKey
ALTER TABLE "ProductWatt" ADD CONSTRAINT "ProductWatt_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
