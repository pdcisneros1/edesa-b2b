import prisma from '@/lib/prisma';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Percent, Clock } from 'lucide-react';

export async function PromotedProducts() {
  const now = new Date();

  try {
    // Consultar productos con promociones activas
    const promotedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      promotions: {
        some: {
          promotion: {
            isActive: true,
            isManuallyDisabled: false,
            OR: [
              // Sin fecha de fin
              {
                validUntil: null,
                OR: [
                  { validFrom: null },
                  { validFrom: { lte: now } },
                ],
              },
              // Con fecha de fin vigente
              {
                validUntil: { gte: now },
                OR: [
                  { validFrom: null },
                  { validFrom: { lte: now } },
                ],
              },
            ],
          },
        },
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { order: 'asc' },
      },
      promotions: {
        where: {
          promotion: {
            isActive: true,
            isManuallyDisabled: false,
            OR: [
              {
                validUntil: null,
                OR: [
                  { validFrom: null },
                  { validFrom: { lte: now } },
                ],
              },
              {
                validUntil: { gte: now },
                OR: [
                  { validFrom: null },
                  { validFrom: { lte: now } },
                ],
              },
            ],
          },
        },
        include: {
          promotion: true,
        },
        take: 1, // Solo la primera promoción activa
      },
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

    // Si no hay productos en promoción, no renderizar la sección
    if (promotedProducts.length === 0) {
      return null;
    }

    return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 py-16">
      {/* Patrón de fondo con puntos */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 mb-4">
            <Percent className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Ofertas Especiales
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Productos en Promoción
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Aprovecha estos descuentos exclusivos en productos seleccionados
          </p>
        </div>

        {/* Grid de productos */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/20 p-6">
          <ProductGrid products={promotedProducts as any} />
        </div>

        {/* Footer con aviso de tiempo limitado */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/80 text-sm">
          <Clock className="h-4 w-4" />
          <span>Promociones por tiempo limitado. Consulta la disponibilidad.</span>
        </div>
      </div>
    </section>
    );
  } catch (error) {
    // Si las tablas de promociones no existen aún, simplemente no mostrar la sección
    console.error('Error al cargar promociones:', error);
    return null;
  }
}
