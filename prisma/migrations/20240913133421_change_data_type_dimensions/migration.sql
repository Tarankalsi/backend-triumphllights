/*
  Warnings:

  - Changed the type of `height` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `item_weight` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `length` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `width` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "height",
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
DROP COLUMN "item_weight",
ADD COLUMN     "item_weight" DOUBLE PRECISION NOT NULL,
DROP COLUMN "length",
ADD COLUMN     "length" DOUBLE PRECISION NOT NULL,
DROP COLUMN "width",
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL;
