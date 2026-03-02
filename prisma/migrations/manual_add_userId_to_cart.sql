-- ============================================================================
-- MIGRACIÓN: Agregar soporte de userId a tabla Cart para multi-dispositivo
-- ============================================================================
-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================================================

-- 1. Agregar columna userId a Cart (opcional, para usuarios autenticados)
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- 2. Crear índice en userId para mejor performance
CREATE INDEX IF NOT EXISTS "Cart_userId_idx" ON "Cart"("userId");

-- 3. Agregar foreign key constraint a User (con CASCADE delete)
ALTER TABLE "Cart"
  ADD CONSTRAINT "Cart_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ============================================================================
-- VERIFICACIÓN: Ejecuta esto para confirmar que se aplicó correctamente
-- ============================================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'Cart' AND column_name = 'userId';
--
-- Deberías ver:
-- column_name | data_type | is_nullable
-- userId      | text      | YES
-- ============================================================================

-- ✅ Migración completa
-- Ahora la tabla Cart puede vincularse tanto a User (B2B autenticados) como a Customer (guests)
