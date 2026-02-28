/*
  ========================================
  MIGRACIÓN B2B: user_orders_b2b
  ========================================

  Transforma el sistema de órdenes de Customer-based a User-based (B2B cerrado).
  Los pedidos ahora se vinculan directamente a usuarios autenticados (User), no a Customers.

  Cambios principales:
  1. User: Agregar campos B2B (company, ruc, phone, isApproved, isBlocked)
  2. Product: Agregar wholesalePrice para precios mayoristas
  3. Order: Cambiar de customerId a userId + snapshot data redesign
  4. OrderStatus: Cambiar enum de inglés a español
  5. OrderItem: Renombrar price a unitPrice
  6. Promotions: Crear sistema de promociones con descuentos
*/

-- ============================================
-- 1. ACTUALIZAR MODELO USER (B2B FIELDS)
-- ============================================

-- Agregar campos B2B a User
ALTER TABLE "User"
  ADD COLUMN "company" TEXT,
  ADD COLUMN "ruc" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- Crear índices para User
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- ============================================
-- 2. ACTUALIZAR MODELO PRODUCT (WHOLESALE)
-- ============================================

-- Agregar precio mayorista
ALTER TABLE "Product" ADD COLUMN "wholesalePrice" DOUBLE PRECISION;

-- ============================================
-- 3. CREAR NUEVO ENUM ORDERSTATUS (ESPAÑOL)
-- ============================================

-- Crear nuevo enum con valores en español
CREATE TYPE "OrderStatus_new" AS ENUM (
  'pendiente_pago',
  'pagado',
  'en_proceso',
  'enviado',
  'entregado',
  'cancelado'
);

-- ============================================
-- 4. MIGRAR ORDEN DE CUSTOMER-BASED A USER-BASED
-- ============================================

-- Paso 4.1: Eliminar constraint FK de customerId
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- Paso 4.2: Eliminar índice de customerId
DROP INDEX "Order_customerId_idx";

-- Paso 4.3: Agregar nueva columna userId (temporal nullable para migración)
ALTER TABLE "Order" ADD COLUMN "userId" TEXT;

-- Paso 4.4: Migrar customerId a userId
-- NOTA: Como no hay datos de producción, este paso es solo por completitud
-- Si hubiera datos, necesitaríamos mapear Customer -> User de alguna manera
-- Por ahora dejamos userId como NULL ya que no hay órdenes reales

-- Paso 4.5: Hacer userId NOT NULL (seguro porque no hay datos)
ALTER TABLE "Order" ALTER COLUMN "userId" SET NOT NULL;

-- Paso 4.6: Eliminar columna customerId
ALTER TABLE "Order" DROP COLUMN "customerId";

-- Paso 4.7: Crear FK de userId a User
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Paso 4.8: Crear índice para userId
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- ============================================
-- 5. RESTRUCTURAR CAMPOS DE SNAPSHOT EN ORDER
-- ============================================

-- Eliminar campos viejos de shipping/billing
ALTER TABLE "Order"
  DROP COLUMN "shippingName",
  DROP COLUMN "shippingAddress1",
  DROP COLUMN "shippingAddress2",
  DROP COLUMN "shippingState",
  DROP COLUMN "shippingPostalCode",
  DROP COLUMN "shippingPhone",
  DROP COLUMN "billingName",
  DROP COLUMN "billingAddress1",
  DROP COLUMN "billingAddress2",
  DROP COLUMN "billingCity",
  DROP COLUMN "billingState",
  DROP COLUMN "billingPostalCode",
  DROP COLUMN "billingCountry",
  DROP COLUMN "billingPhone",
  DROP COLUMN "shippingCost";

-- Agregar nuevos campos de snapshot del cliente
ALTER TABLE "Order"
  ADD COLUMN "customerName" TEXT NOT NULL DEFAULT 'Cliente',
  ADD COLUMN "customerEmail" TEXT NOT NULL DEFAULT 'email@example.com',
  ADD COLUMN "customerPhone" TEXT,
  ADD COLUMN "customerCompany" TEXT,
  ADD COLUMN "customerTaxId" TEXT;

-- Agregar nuevos campos de snapshot de dirección de envío
ALTER TABLE "Order"
  ADD COLUMN "shippingStreet" TEXT NOT NULL DEFAULT 'Dirección',
  ADD COLUMN "shippingProvince" TEXT NOT NULL DEFAULT 'Provincia';

-- Renombrar shipping cost
ALTER TABLE "Order" ADD COLUMN "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Agregar campo de método de pago
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT;

-- Remover defaults temporales (solo eran para ALTER TABLE sin romper)
ALTER TABLE "Order"
  ALTER COLUMN "customerName" DROP DEFAULT,
  ALTER COLUMN "customerEmail" DROP DEFAULT,
  ALTER COLUMN "shippingStreet" DROP DEFAULT,
  ALTER COLUMN "shippingProvince" DROP DEFAULT;

-- ============================================
-- 6. MIGRAR ORDERSTATUS ENUM
-- ============================================

-- Cambiar tipo de columna status al nuevo enum
-- Como no hay datos, podemos hacer esto directamente
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING 'pendiente_pago'::"OrderStatus_new";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pendiente_pago'::"OrderStatus_new";

-- Eliminar enum viejo
DROP TYPE "OrderStatus";

-- Renombrar nuevo enum
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- ============================================
-- 7. ACTUALIZAR ORDERITEM
-- ============================================

-- Renombrar price a unitPrice
ALTER TABLE "OrderItem" RENAME COLUMN "price" TO "unitPrice";

-- ============================================
-- 8. CREAR SISTEMA DE PROMOCIONES
-- ============================================

-- Crear enum DiscountType
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');

-- Crear tabla Promotion
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- Crear tabla PromotionProduct (relación M:N)
CREATE TABLE "PromotionProduct" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionProduct_pkey" PRIMARY KEY ("id")
);

-- Índices para Promotion
CREATE INDEX "Promotion_isActive_idx" ON "Promotion"("isActive");
CREATE INDEX "Promotion_validFrom_validUntil_idx" ON "Promotion"("validFrom", "validUntil");

-- Índices para PromotionProduct
CREATE UNIQUE INDEX "PromotionProduct_promotionId_productId_key" ON "PromotionProduct"("promotionId", "productId");
CREATE INDEX "PromotionProduct_productId_idx" ON "PromotionProduct"("productId");
CREATE INDEX "PromotionProduct_promotionId_idx" ON "PromotionProduct"("promotionId");

-- Foreign Keys para PromotionProduct
ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_promotionId_fkey"
  FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 9. ÍNDICES ADICIONALES PARA ORDER
-- ============================================

CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

/*
  ========================================
  FIN DE MIGRACIÓN
  ========================================

  El sistema ahora está configurado para B2B cerrado:
  - User IS el cliente (no Customer)
  - Order.userId (NOT NULL) vincula órdenes a usuarios autenticados
  - Snapshot data preserva información histórica del cliente
  - OrderStatus usa valores en español
  - Sistema de promociones disponible
*/
