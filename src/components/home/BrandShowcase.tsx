import prisma from '@/lib/prisma';

export async function BrandShowcase() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    take: 8,
  });

  if (brands.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-100">
      <div className="container">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Marcas que distribuimos
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            Marcas de Confianza
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="group flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors tracking-wide">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
