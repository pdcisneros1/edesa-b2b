/**
 * Verificar configuración de buckets
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔍 Verificando buckets...\n');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  buckets?.forEach(bucket => {
    console.log(`📦 Bucket: ${bucket.name}`);
    console.log(`   Público: ${bucket.public ? '✅ Sí' : '❌ No'}`);
    console.log(`   ID: ${bucket.id}`);
    console.log();
  });

  console.log('✅ Verificación completa');
}

main();
