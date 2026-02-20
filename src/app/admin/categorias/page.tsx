import prisma from '@/lib/prisma';
import { FolderTree } from 'lucide-react';

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  const mainCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {categories.length} categorías en total
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {mainCategories.map((category) => {
          const subs = subCategories.filter((s) => s.parentId === category.id);

          return (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-md bg-gray-100 p-1.5">
                  <FolderTree className="h-4 w-4 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
              </div>
              {category.description && (
                <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mb-3 tabular-nums">
                {category._count.products} productos
              </p>
              {subs.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Subcategorías
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {subs.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
