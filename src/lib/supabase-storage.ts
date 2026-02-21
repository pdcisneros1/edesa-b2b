import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidas en .env'
  );
}

/**
 * Cliente de Supabase con Service Role Key para operaciones de servidor
 * (subida de archivos, operaciones admin).
 * NO usar en el cliente - solo en API routes y Server Components.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Sube un archivo a Supabase Storage.
 *
 * @param bucket - Nombre del bucket (ej: 'products', 'documents')
 * @param file - Buffer del archivo a subir
 * @param filename - Nombre del archivo con extensión
 * @param contentType - MIME type del archivo
 * @returns URL pública del archivo subido
 */
export async function uploadToStorage(
  bucket: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, file, {
      contentType,
      upsert: false, // No sobrescribir si ya existe
    });

  if (error) {
    console.error('[Supabase Storage] Error al subir:', error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  // Obtener URL pública
  const { data: publicData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

/**
 * Elimina un archivo de Supabase Storage.
 *
 * @param bucket - Nombre del bucket
 * @param path - Ruta del archivo dentro del bucket
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

  if (error) {
    console.error('[Supabase Storage] Error al eliminar:', error);
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
}
