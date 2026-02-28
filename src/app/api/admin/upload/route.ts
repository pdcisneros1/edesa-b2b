import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { requireCsrfToken } from '@/lib/csrf';
import { uploadToStorage } from '@/lib/supabase-storage';
import path from 'path';

// ─── Configuración de tipos permitidos ───────────────────────────────────────

/** Mapa de tipo MIME → magic bytes (firmas de archivo) para validación real.
 * Esto previene que un atacante renombre un archivo malicioso con extensión .jpg.
 */
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
  'image/jpeg': [
    { bytes: [0xff, 0xd8], offset: 0 }, // JPEG (solo primeros 2 bytes - más compatible)
  ],
  'image/png': [
    { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 }, // PNG signature completa
  ],
  'image/webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF
    { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // WEBP
  ],
  'image/jpg': [
    { bytes: [0xff, 0xd8], offset: 0 }, // JPEG alias
  ],
  'application/pdf': [
    { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }, // %PDF
  ],
};

const ALLOWED_MIME_TYPES = Object.keys(MAGIC_BYTES);

// Extensiones permitidas por tipo MIME
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

/** Verifica las magic bytes de un buffer contra las firmas conocidas del tipo MIME. */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  // Para WebP, verificar ambas firmas (RIFF y WEBP)
  if (mimeType === 'image/webp') {
    return signatures.every(({ bytes, offset }) => {
      if (buffer.length < offset + bytes.length) return false;
      return bytes.every((byte, i) => buffer[offset + i] === byte);
    });
  }

  // Para otros formatos, verificar cualquier firma
  return signatures.some(({ bytes, offset }) => {
    if (buffer.length < offset + bytes.length) return false;
    return bytes.every((byte, i) => buffer[offset + i] === byte);
  });
}

/** Sanitiza el nombre de archivo para prevenir path traversal y caracteres peligrosos. */
function sanitizeFilename(filename: string): string {
  // Obtener solo el basename (sin directorios)
  const base = path.basename(filename);
  // Eliminar caracteres peligrosos, permitir solo alfanuméricos, guiones, puntos y guiones bajos
  return base
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/\.{2,}/g, '.') // Eliminar doble punto (path traversal)
    .substring(0, 100); // Limitar longitud
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  // 🔒 CSRF Protection
  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('[Upload] No se proporcionó archivo');
      return NextResponse.json(
        { error: 'No se proporcionó un archivo' },
        { status: 400 }
      );
    }

    console.log('[Upload] Archivo recibido:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validar tipo MIME declarado por el cliente (primera verificación)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error('[Upload] Tipo MIME no permitido:', file.type);
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo JPG, PNG, WebP y PDF' },
        { status: 400 }
      );
    }

    // Validar tamaño: 5MB para imágenes, 10MB para PDFs
    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeLabel = file.type === 'application/pdf' ? '10MB' : '5MB';

    if (file.size > maxSize) {
      console.error('[Upload] Archivo muy grande:', file.size, 'bytes, máx:', maxSize);
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${maxSizeLabel}` },
        { status: 400 }
      );
    }

    // Rechazar archivos vacíos
    if (file.size === 0) {
      console.error('[Upload] Archivo vacío');
      return NextResponse.json(
        { error: 'El archivo está vacío' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('[Upload] Magic bytes (primeros 12):',
      Array.from(buffer.slice(0, 12)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')
    );

    // Validar magic bytes (segunda verificación — no confiar en el tipo declarado)
    if (!validateMagicBytes(buffer, file.type)) {
      console.error('[Upload] Magic bytes inválidos para tipo:', file.type);
      return NextResponse.json(
        { error: 'El contenido del archivo no coincide con su tipo declarado' },
        { status: 400 }
      );
    }

    // Validar extensión del archivo
    const originalExt = path.extname(file.name).toLowerCase();
    const allowedExts = ALLOWED_EXTENSIONS[file.type] ?? [];
    if (!allowedExts.includes(originalExt)) {
      console.error('[Upload] Extensión no permitida:', originalExt, 'para tipo:', file.type);
      return NextResponse.json(
        { error: `Extensión de archivo no permitida para el tipo ${file.type}` },
        { status: 400 }
      );
    }

    // Generar nombre único con timestamp (previene colisiones)
    const timestamp = Date.now();
    const isPDF = file.type === 'application/pdf';
    const sanitizedName = sanitizeFilename(file.name);
    const filename = isPDF
      ? `ficha_${timestamp}_${sanitizedName}`
      : `product_${timestamp}_${sanitizedName}`;

    // Determinar bucket de Supabase Storage
    const bucket = isPDF ? 'documents' : 'products';

    console.log('[Upload] Subiendo a Supabase Storage:', { bucket, filename });

    // Subir a Supabase Storage
    const publicUrl = await uploadToStorage(bucket, buffer, filename, file.type);

    console.log('[Upload] Archivo subido exitosamente. URL:', publicUrl);

    // Retornar URL en el formato esperado por el frontend (compatible con rutas locales)
    // El frontend espera /images/products/... pero en Supabase tenemos la URL completa
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('[Upload] Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    );
  }
}
