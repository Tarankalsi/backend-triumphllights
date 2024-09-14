-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "watt_id" TEXT;

-- CreateIndex
CREATE INDEX "ProductWatt_product_id_idx" ON "ProductWatt"("product_id");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_watt_id_fkey" FOREIGN KEY ("watt_id") REFERENCES "ProductWatt"("watt_id") ON DELETE SET NULL ON UPDATE CASCADE;
