import prisma from '@/lib/prisma';

export async function BrandShowcase() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    take: 8,
  });

  if (brands.length === 0) return null;

  return (
    <section className="bg-gray-50 border-t border-gray-100 py-14 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 animate-fade-in-up opacity-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Marcas que distribuimos
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            Marcas de Confianza
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {brands.map((brand, idx) => (
            <div
              key={brand.id}
              className="group flex items-center justify-center rounded-xl border border-gray-200 bg-white px-10 py-5 hover:border-gray-300 hover:shadow-sm transition-all animate-fade-in-up opacity-0"
              style={{ animationDelay: `${Math.min(idx * 100, 700)}ms` }}
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
