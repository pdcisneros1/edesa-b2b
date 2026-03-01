-- ============================================================================
-- MIGRACIÓN: TRACKING DE CONVERSIÓN Y ABANDONO DE CARRITO
-- ============================================================================
-- Fecha: 2026-03-01
-- Descripción: Añade campos para tracking de sesiones y tabla de carritos abandonados
--
-- INSTRUCCIONES:
-- 1. Abre Supabase Dashboard → SQL Editor
-- 2. Copia y pega este SQL completo
-- 3. Haz clic en "Run" o presiona Ctrl+Enter
-- ============================================================================

-- 1. Añadir campos de tracking de conversión a tabla User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "sessionCount" INTEGER NOT NULL DEFAULT 0;

-- Crear índice para búsquedas rápidas por fecha de último login
CREATE INDEX IF NOT EXISTS "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- 2. Crear enum para estados de carrito abandonado
DO $$ BEGIN
  CREATE TYPE "AbandonedCartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'RECOVERED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Crear tabla AbandonedCart
CREATE TABLE IF NOT EXISTS "AbandonedCart" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "items" JSONB NOT NULL,
  "subtotal" DOUBLE PRECISION NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "status" "AbandonedCartStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "recoveryEmailSent" BOOLEAN NOT NULL DEFAULT false,
  "recoveryEmailSentAt" TIMESTAMP(3),
  "convertedToOrderId" TEXT,
  "customerEmail" TEXT,
  "customerName" TEXT,

  CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY ("id")
);

-- 4. Crear foreign key a User (si no existe)
DO $$ BEGIN
  ALTER TABLE "AbandonedCart"
    ADD CONSTRAINT "AbandonedCart_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "AbandonedCart_userId_idx" ON "AbandonedCart"("userId");
CREATE INDEX IF NOT EXISTS "AbandonedCart_status_idx" ON "AbandonedCart"("status");
CREATE INDEX IF NOT EXISTS "AbandonedCart_createdAt_idx" ON "AbandonedCart"("createdAt");
CREATE INDEX IF NOT EXISTS "AbandonedCart_recoveryEmailSent_idx" ON "AbandonedCart"("recoveryEmailSent");

-- ============================================================================
-- VERIFICACIÓN (ejecuta esto después para confirmar que funcionó)
-- ============================================================================
-- Mostrar columnas nuevas en User
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User' AND column_name IN ('lastLoginAt', 'sessionCount')
ORDER BY ordinal_position;

-- Mostrar estructura de AbandonedCart
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'AbandonedCart'
ORDER BY ordinal_position;

-- ============================================================================
-- ✅ SI VES RESULTADOS ARRIBA, LA MIGRACIÓN FUE EXITOSA
-- ============================================================================
