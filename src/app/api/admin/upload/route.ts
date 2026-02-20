import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ─── Configuración de tipos permitidos ───────────────────────────────────────

/** Mapa de tipo MIME → magic bytes (firmas de archivo) para validación real.
 * Esto previene que un atacante renombre un archivo malicioso con extensión .jpg.
 */
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
  'image/jpeg': [
    { bytes: [0xff, 0xd8, 0xff], offset: 0 }, // JPEG
  ],
  'image/png': [
    { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 }, // PNG
  ],
  'image/webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF (WebP container)
  ],
  'image/jpg': [
    { bytes: [0xff, 0xd8, 0xff], offset: 0 }, // JPEG alias
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

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó un archivo' },
        { status: 400 }
      );
    }

    // Validar tipo MIME declarado por el cliente (primera verificación)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo JPG, PNG, WebP y PDF' },
        { status: 400 }
      );
    }

    // Validar tamaño: 5MB para imágenes, 10MB para PDFs
    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeLabel = file.type === 'application/pdf' ? '10MB' : '5MB';

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${maxSizeLabel}` },
        { status: 400 }
      );
    }

    // Rechazar archivos vacíos
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'El archivo está vacío' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar magic bytes (segunda verificación — no confiar en el tipo declarado)
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'El contenido del archivo no coincide con su tipo declarado' },
        { status: 400 }
      );
    }

    // Validar extensión del archivo
    const originalExt = path.extname(file.name).toLowerCase();
    const allowedExts = ALLOWED_EXTENSIONS[file.type] ?? [];
    if (!allowedExts.includes(originalExt)) {
      return NextResponse.json(
        { error: `Extensión de archivo no permitida para el tipo ${file.type}` },
        { status: 400 }
      );
    }

    // Generar nombre único con timestamp (previene colisiones)
    const timestamp = Date.now();
    const isPDF = file.type === 'application/pdf';
    const filename = isPDF
      ? `ficha_${timestamp}${originalExt}`
      : `product_${timestamp}${originalExt}`;

    // Determinar directorio destino
    const subDir = isPDF ? 'documents' : path.join('images', 'products');
    const publicDir = path.resolve(process.cwd(), 'public', subDir);
    const filepath = path.resolve(publicDir, filename);

    // CRÍTICO: Verificar que el filepath final está dentro del directorio esperado (path traversal)
    if (!filepath.startsWith(publicDir)) {
      return NextResponse.json(
        { error: 'Ruta de archivo inválida' },
        { status: 400 }
      );
    }

    // Asegurar que el directorio existe
    await mkdir(publicDir, { recursive: true });

    await writeFile(filepath, buffer);

    const url = `/${subDir.replace(/\\/g, '/')}/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
