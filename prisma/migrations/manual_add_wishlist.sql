-- ============================================================================
-- MIGRACIÓN: Tabla Wishlist (Listas de Deseos / Favoritos)
-- ============================================================================
-- APLICAR EN: Supabase SQL Editor
-- ============================================================================

-- 1. Crear tabla Wishlist
CREATE TABLE IF NOT EXISTS "Wishlist" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  -- Un usuario solo puede tener un producto una vez en favoritos
  CONSTRAINT "Wishlist_userId_productId_key" UNIQUE ("userId", "productId")
);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS "Wishlist_userId_idx" ON "Wishlist"("userId");
CREATE INDEX IF NOT EXISTS "Wishlist_productId_idx" ON "Wishlist"("productId");

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'Wishlist'
-- ORDER BY ordinal_position;
--
-- Deberías ver:
-- id         | text
-- userId     | text
-- productId  | text
-- createdAt  | timestamp
-- ============================================================================

-- ✅ Migración completa
-- Ahora los usuarios B2B pueden guardar productos favoritos
