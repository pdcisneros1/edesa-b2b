/**
 * Script para agregar campos de inventario inteligente a la tabla Product
 * Ejecutar con: npx tsx scripts/add-inventory-fields.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Agregando campos de inventario inteligente...\n');

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

    console.log('✅ Campos agregados exitosamente en base de datos local\n');

    // Generar cliente de Prisma
    console.log('🔄 Regenerando Prisma Client...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync('npx prisma generate');
    console.log('✅ Prisma Client regenerado\n');

    console.log('🎉 Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
