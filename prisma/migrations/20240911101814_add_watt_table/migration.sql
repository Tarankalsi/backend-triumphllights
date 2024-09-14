/*
  Warnings:

  - You are about to drop the column `watt_id` on the `CartItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_watt_id_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "watt_id",
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "watt" INTEGER;
