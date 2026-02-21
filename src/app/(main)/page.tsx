import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromotedProducts } from '@/components/home/PromotedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BrandShowcase } from '@/components/home/BrandShowcase';
import { SITE_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store } from 'lucide-react';

export const metadata: Metadata = {
  title: `${SITE_NAME} | Distribución Mayorista de Sanitarios Ecuador`,
  description:
    'Catálogo mayorista de sanitarios, griferías, lavamanos y acabados de construcción. Precios exclusivos para ferreterías y sub-distribuidores en Ecuador.',
  openGraph: {
    title: `${SITE_NAME} | Distribución Mayorista de Sanitarios Ecuador`,
    description:
      'Catálogo mayorista de sanitarios, griferías y acabados de construcción. Distribución a ferreterías en todo Ecuador.',
  },
};

// Forzar rendering dinámico en runtime (no pre-renderizar durante build)
// Necesario porque los componentes usan Prisma
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PromotedProducts />
      <FeaturedProducts />
      <CategoryGrid />
      <BrandShowcase />

      {/* B2B CTA Section */}
      <section className="bg-gray-900 py-14 md:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/70">
              <Store className="h-3.5 w-3.5 text-primary" />
              Para Ferreterías y Distribuidores
            </div>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl tracking-tight leading-snug">
              ¿Eres ferretero o distribuidor?
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Accede a precios mayoristas exclusivos, gestiona tus pedidos y trabaja directamente con el distribuidor más grande de sanitarios en Ecuador.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button asChild size="lg" className="gap-2 font-bold">
                <Link href="/register">
                  Registrar mi Ferretería
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30"
              >
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
