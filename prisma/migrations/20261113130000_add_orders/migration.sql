CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'whatsapp_pending',
    "items" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "deliveryAddress" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
