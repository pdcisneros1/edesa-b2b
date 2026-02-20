import prisma from '@/lib/prisma';
import { Tag } from 'lucide-react';

export default async function AdminMarcasPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Marcas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {brands.length} marcas registradas
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="rounded-md bg-primary/8 p-1.5">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">{brand.name}</h3>
            </div>
            {brand.description && (
              <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">
                {brand.description}
              </p>
            )}
            <p className="text-xs text-gray-400 tabular-nums">
              {brand._count.products} productos
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
