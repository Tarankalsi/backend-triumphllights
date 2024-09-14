/*
  Warnings:

  - You are about to drop the column `price` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `watt` on the `CartItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "price",
DROP COLUMN "watt",
ADD COLUMN     "watt_id" TEXT;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_watt_id_fkey" FOREIGN KEY ("watt_id") REFERENCES "ProductWatt"("watt_id") ON DELETE SET NULL ON UPDATE CASCADE;
