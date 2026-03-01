#!/usr/bin/env node

/**
 * Script para ejecutar migración SQL directamente en PostgreSQL
 * Usa conexión directa (no pooler) para soportar DDL
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Leer DATABASE_URL del .env
require('dotenv').config();

// Convertir de pooler a conexión directa
const poolerUrl = process.env.DATABASE_URL;
if (!poolerUrl) {
  console.error('❌ ERROR: DATABASE_URL no encontrada en .env');
  process.exit(1);
}

// Extraer ID del proyecto de la URL
// Formato: postgresql://postgres.{id}:password@host...
const projectIdMatch = poolerUrl.match(/postgres\.([a-z0-9]+):/);
if (!projectIdMatch) {
  console.error('❌ ERROR: No se pudo extraer el ID del proyecto de DATABASE_URL');
  console.error('DATABASE_URL actual:', poolerUrl.substring(0, 50) + '...');
  process.exit(1);
}
const projectId = projectIdMatch[1];
console.log('📍 ID del proyecto:', projectId);

// Construir URL de conexión directa (Supabase usa el formato: proyecto.supabase.co)
const directUrl = poolerUrl
  .replace(/aws-0-us-west-2\.pooler\.supabase\.com:6543/, `${projectId}.supabase.co:5432`)
  .replace('?pgbouncer=true&statement_cache_size=0', '');

console.log('🔄 Conectando a PostgreSQL (conexión directa)...');
console.log('📍 URL generada:', directUrl.replace(/:([^:]+)@/, ':****@')); // Ocultar password
console.log('📍 Host:', directUrl.includes('.supabase.co:5432') ? 'Conexión directa ✓' : 'ADVERTENCIA: No es conexión directa');

const client = new Client({
  connectionString: directUrl,
  ssl: { rejectUnauthorized: false }, // Supabase requiere SSL
});

// SQL de migración
const migrationSQL = `
-- Añadir campos de tracking de conversión a tabla User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "sessionCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- Crear enum para estados de carrito abandonado
DO $$ BEGIN
  CREATE TYPE "AbandonedCartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'RECOVERED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Crear tabla AbandonedCart
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

-- Crear foreign key a User
DO $$ BEGIN
  ALTER TABLE "AbandonedCart"
    ADD CONSTRAINT "AbandonedCart_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Crear índices
CREATE INDEX IF NOT EXISTS "AbandonedCart_userId_idx" ON "AbandonedCart"("userId");
CREATE INDEX IF NOT EXISTS "AbandonedCart_status_idx" ON "AbandonedCart"("status");
CREATE INDEX IF NOT EXISTS "AbandonedCart_createdAt_idx" ON "AbandonedCart"("createdAt");
CREATE INDEX IF NOT EXISTS "AbandonedCart_recoveryEmailSent_idx" ON "AbandonedCart"("recoveryEmailSent");
`;

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    console.log('🔄 Ejecutando migración...');
    await client.query(migrationSQL);

    console.log('✅ Migración ejecutada exitosamente');

    // Verificar que las tablas se crearon
    console.log('\n🔍 Verificando resultado...\n');

    const userColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name IN ('lastLoginAt', 'sessionCount')
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas nuevas en User:');
    console.table(userColumns.rows);

    const cartColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'AbandonedCart'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura de AbandonedCart:');
    console.table(cartColumns.rows);

    console.log('\n✅ ¡MIGRACIÓN COMPLETADA CON ÉXITO!');

  } catch (error) {
    console.error('\n❌ ERROR al ejecutar migración:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
