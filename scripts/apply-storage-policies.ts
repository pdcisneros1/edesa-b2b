/**
 * Script para aplicar políticas de Storage a Supabase.
 * Ejecutar: npx tsx scripts/apply-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔒 Aplicando políticas de Storage...\n');

  const sqlPath = path.join(process.cwd(), 'scripts', 'setup-storage-policies.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Dividir en sentencias individuales
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.log(`⚠️  ${error.message}`);
      } else {
        console.log('✅ Política aplicada');
      }
    } catch (error: any) {
      console.log(`⚠️  ${error.message}`);
    }
  }

  console.log('\n✅ ¡Políticas configuradas!');
  console.log('\n📝 Nota: Si viste errores de "already exists", está OK - significa que ya estaban creadas.');
}

main().catch(console.error);
