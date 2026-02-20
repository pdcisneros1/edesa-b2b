import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET all products
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, brand: true }
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  try {
    const data = await request.json();

    // Validar campos requeridos mínimos
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'El nombre del producto es requerido' }, { status: 400 });
    }
    if (!data.sku || typeof data.sku !== 'string') {
      return NextResponse.json({ error: 'El SKU es requerido' }, { status: 400 });
    }
    const price = Number(data.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'El precio debe ser un número válido mayor o igual a 0' }, { status: 400 });
    }
    if (!data.categoryId || typeof data.categoryId !== 'string') {
      return NextResponse.json({ error: 'La categoría es requerida' }, { status: 400 });
    }

    const { images, specifications, category, brand, id, createdAt, updatedAt, ...rest } = data;

    // Sanitizar slug: solo minúsculas, números y guiones
    const rawSlug = rest.slug || rest.name;
    const sanitizedSlug = String(rawSlug)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);

    const product = await prisma.product.create({
      data: {
        sku: String(rest.sku).trim().substring(0, 50),
        name: String(rest.name).trim().substring(0, 200),
        slug: sanitizedSlug,
        description: rest.description ? String(rest.description).trim().substring(0, 5000) : '',
        shortDescription: rest.shortDescription ? String(rest.shortDescription).trim().substring(0, 500) : null,
        price: Math.max(0, Number(rest.price) || 0),
        wholesalePrice: rest.wholesalePrice != null && rest.wholesalePrice !== '' ? Math.max(0, Number(rest.wholesalePrice)) : null,
        compareAtPrice: rest.compareAtPrice != null && rest.compareAtPrice !== '' ? Math.max(0, Number(rest.compareAtPrice)) : null,
        costPrice: rest.costPrice != null && rest.costPrice !== '' ? Math.max(0, Number(rest.costPrice)) : null,
        stock: Math.max(0, Math.round(Number(rest.stock)) || 0),
        categoryId: rest.categoryId,
        brandId: rest.brandId || null,
        technicalSheet: rest.technicalSheet || null,
        isActive: rest.isActive ?? true,
        isFeatured: rest.isFeatured ?? false,
        isNew: rest.isNew ?? false,
        images: images && images.length > 0 ? {
          create: images.map((img: { url: string; alt?: string }, index: number) => ({
            url: String(img.url).substring(0, 500),
            alt: img.alt ? String(img.alt).substring(0, 200) : String(rest.name).substring(0, 200),
            order: index,
          }))
        } : undefined,
        specifications: specifications && specifications.length > 0 ? {
          create: specifications.map((spec: { key: string; value: string }, index: number) => ({
            key: String(spec.key).trim().substring(0, 100),
            value: String(spec.value).trim().substring(0, 500),
            order: index,
          }))
        } : undefined,
      },
      include: {
        images: true,
        specifications: true,
        category: true,
        brand: true,
      }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}
