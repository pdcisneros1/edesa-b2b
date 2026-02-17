import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET all products
export async function GET(request: NextRequest) {
  const { authenticated } = await requireAuth(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, brand: true }
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth(request);

  if (!authenticated) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const { images, specifications, category, brand, id, createdAt, updatedAt, ...rest } = data;

    const product = await prisma.product.create({
      data: {
        sku: rest.sku,
        name: rest.name,
        slug: rest.slug || rest.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: rest.description,
        shortDescription: rest.shortDescription || null,
        price: Number(rest.price) || 0,
        compareAtPrice: rest.compareAtPrice ? Number(rest.compareAtPrice) : null,
        costPrice: rest.costPrice ? Number(rest.costPrice) : null,
        stock: Math.round(Number(rest.stock)) || 0,
        categoryId: rest.categoryId,
        brandId: rest.brandId || null,
        technicalSheet: rest.technicalSheet || null,
        isActive: rest.isActive ?? true,
        isFeatured: rest.isFeatured ?? false,
        isNew: rest.isNew ?? false,
        images: images && images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || rest.name,
            order: index,
          }))
        } : undefined,
        specifications: specifications && specifications.length > 0 ? {
          create: specifications.map((spec: any, index: number) => ({
            key: spec.key,
            value: spec.value,
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
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}
