import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó un archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo JPG, PNG, WebP y PDF' },
        { status: 400 }
      );
    }

    // Validate file size (5MB for images, 10MB for PDFs)
    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeLabel = file.type === 'application/pdf' ? '10MB' : '5MB';

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${maxSizeLabel}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const isPDF = file.type === 'application/pdf';
    const filename = isPDF ? `ficha_${timestamp}${ext}` : `product_${timestamp}${ext}`;

    // Save to appropriate directory
    const subDir = isPDF ? 'documents' : path.join('images', 'products');
    const publicDir = path.join(process.cwd(), 'public', subDir);
    const filepath = path.join(publicDir, filename);

    await writeFile(filepath, buffer);

    const url = `/${subDir}/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
