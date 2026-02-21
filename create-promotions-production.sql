-- Script SQL para crear tablas de promociones en producción
-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard/project/[tu-proyecto]/sql

-- 1. Crear enum DiscountType
DO $$ BEGIN
  CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Crear tabla Promotion
CREATE TABLE IF NOT EXISTS "Promotion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "discountType" "DiscountType" NOT NULL,
  "discountValue" DOUBLE PRECISION NOT NULL,
  "validFrom" TIMESTAMP(3),
  "validUntil" TIMESTAMP(3),
  "daysFromActivation" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isManuallyDisabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear índices en Promotion
CREATE INDEX IF NOT EXISTS "Promotion_isActive_idx" ON "Promotion"("isActive");
CREATE INDEX IF NOT EXISTS "Promotion_validFrom_validUntil_idx" ON "Promotion"("validFrom", "validUntil");

-- 4. Crear tabla PromotionProduct
CREATE TABLE IF NOT EXISTS "PromotionProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "promotionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromotionProduct_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PromotionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Crear índices en PromotionProduct
CREATE UNIQUE INDEX IF NOT EXISTS "PromotionProduct_promotionId_productId_key" ON "PromotionProduct"("promotionId", "productId");
CREATE INDEX IF NOT EXISTS "PromotionProduct_productId_idx" ON "PromotionProduct"("productId");
CREATE INDEX IF NOT EXISTS "PromotionProduct_promotionId_idx" ON "PromotionProduct"("promotionId");

-- 6. Agregar relación promotions a Product (si no existe)
DO $$
BEGIN
  -- Esta columna no es necesaria, la relación es a través de PromotionProduct
  -- Solo verificamos que la tabla Product existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Product') THEN
    RAISE EXCEPTION 'La tabla Product no existe. Verifica tu schema de Prisma.';
  END IF;
END $$;

-- Verificación final
SELECT
  'Promotion' as tabla,
  COUNT(*) as registros
FROM "Promotion"
UNION ALL
SELECT
  'PromotionProduct' as tabla,
  COUNT(*) as registros
FROM "PromotionProduct";
