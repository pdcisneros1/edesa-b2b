/**
 * Script para agregar campos de inventario inteligente en PRODUCCIÓN
 * Ejecutar con: npx tsx scripts/add-inventory-fields-prod.ts
 */

import { PrismaClient } from '@prisma/client';

// Usar DATABASE_URL de producción
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🔧 Agregando campos de inventario inteligente en PRODUCCIÓN...\n');
  console.log('📊 Conectando a:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0], '\n');

  try {
    // Agregar columnas nuevas
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product"
      ADD COLUMN IF NOT EXISTS "safetyStock" INTEGER,
      ADD COLUMN IF NOT EXISTS "reorderPoint" INTEGER,
      ADD COLUMN IF NOT EXISTS "reorderQuantity" INTEGER,
      ADD COLUMN IF NOT EXISTS "leadTimeDays" INTEGER DEFAULT 7,
      ADD COLUMN IF NOT EXISTS "averageMonthlySales" DOUBLE PRECISION;
    `);

    console.log('✅ Campos agregados exitosamente en base de datos de PRODUCCIÓN\n');

    // Verificar que los campos existen
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Product'
      AND column_name IN ('safetyStock', 'reorderPoint', 'reorderQuantity', 'leadTimeDays', 'averageMonthlySales')
      ORDER BY column_name;
    `);

    console.log('📋 Verificación de campos:');
    console.table(result);

    console.log('\n🎉 Migración en PRODUCCIÓN completada exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
