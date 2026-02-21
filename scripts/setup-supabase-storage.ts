/**
 * Script para configurar Supabase Storage automáticamente.
 * Crea los buckets necesarios y configura las políticas de acceso.
 *
 * Ejecutar: npx tsx scripts/setup-supabase-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createBucket(bucketName: string, isPublic: boolean = true) {
  console.log(`\n📦 Creando bucket: ${bucketName}...`);

  // Verificar si el bucket ya existe
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error(`❌ Error al listar buckets:`, listError.message);
    return false;
  }

  const bucketExists = existingBuckets?.some((b) => b.name === bucketName);

  if (bucketExists) {
    console.log(`ℹ️  Bucket "${bucketName}" ya existe`);
    return true;
  }

  // Crear bucket
  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: isPublic,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: bucketName === 'products'
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['application/pdf'],
  });

  if (error) {
    console.error(`❌ Error al crear bucket "${bucketName}":`, error.message);
    return false;
  }

  console.log(`✅ Bucket "${bucketName}" creado exitosamente`);
  return true;
}

async function setupStoragePolicies() {
  console.log('\n🔒 Configurando políticas de acceso (RLS)...');
  console.log('ℹ️  Las políticas se configuran desde el dashboard de Supabase:');
  console.log('   https://supabase.com/dashboard/project/qkusdnxvjycdsfiglfob/storage/policies');
  console.log('\n   Necesitas crear manualmente:');
  console.log('   1. Policy para SELECT (leer): permitir a todos (true)');
  console.log('   2. Policy para INSERT (subir): permitir solo autenticados (authenticated)');
  console.log('   3. Policy para DELETE (eliminar): permitir solo autenticados (authenticated)');
  console.log('\n   O ejecuta este SQL en el SQL Editor:');
  console.log(`
-- Políticas para bucket 'products'
CREATE POLICY "Permitir lectura pública de productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Permitir subida a admins"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminar a admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Políticas para bucket 'documents'
CREATE POLICY "Permitir lectura pública de documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Permitir subida de documentos a admins"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminar documentos a admins"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
  `);
}

async function main() {
  console.log('🚀 Iniciando configuración de Supabase Storage...\n');
  console.log(`📍 Proyecto: ${supabaseUrl}`);

  // Crear buckets
  const productsCreated = await createBucket('products', true);
  const documentsCreated = await createBucket('documents', true);

  if (!productsCreated || !documentsCreated) {
    console.error('\n❌ Hubo errores al crear los buckets');
    process.exit(1);
  }

  // Mostrar instrucciones para políticas
  await setupStoragePolicies();

  console.log('\n✅ ¡Configuración completada!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Ejecuta las políticas SQL mostradas arriba (o configura desde el dashboard)');
  console.log('   2. Reinicia el servidor: npm run dev');
  console.log('   3. Prueba subir una imagen en http://localhost:3000/admin/productos');
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
