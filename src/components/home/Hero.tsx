'use client';

import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const slides = [
  {
    id: 1,
    tag: 'Distribución B2B · Ecuador',
    title: 'Productos de Calidad Premium',
    description: 'Las mejores marcas en sanitarios, griferías y acabados para proyectos de construcción en todo el país.',
    cta: 'Ver Productos',
    href: '/productos',
    bg: 'from-gray-950 via-gray-900 to-slate-900',
  },
  {
    id: 2,
    tag: 'Recién llegados',
    title: 'Nuevos Productos en Stock',
    description: 'Descubre nuestra última colección de lavamanos, griferías y accesorios modernos para tus proyectos.',
    cta: 'Ver Novedades',
    href: '/productos?new=true',
    bg: 'from-red-950 via-primary/90 to-red-900',
  },
  {
    id: 3,
    tag: 'Selección destacada',
    title: 'Ofertas Especiales',
    description: 'Aprovecha descuentos exclusivos en productos seleccionados para ferreterías y constructoras.',
    cta: 'Ver Ofertas',
    href: '/productos?featured=true',
    bg: 'from-slate-900 via-slate-800 to-zinc-900',
  },
];

export function Hero() {
  return (
    <section className="w-full">
      <Carousel
        opts={{ align: 'start', loop: true }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className={`relative overflow-hidden bg-gradient-to-br ${slide.bg}`}>
                {/* Dot pattern overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                {/* Gradient accent */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />

                <div className="container relative py-16 md:py-24 lg:py-32">
                  <div className="max-w-2xl animate-fade-in-up">
                    {/* Tag */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/70 mb-5 backdrop-blur-sm animate-fade-in delay-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {slide.tag}
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl mb-5 leading-[1.1] animate-fade-in delay-200">
                      {slide.title}
                    </h1>

                    <p className="text-base sm:text-lg text-white/60 mb-8 max-w-xl leading-relaxed animate-fade-in delay-300">
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap gap-3 animate-fade-in delay-400">
                      <Button
                        asChild
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100 font-bold shadow-lg gap-2 px-6"
                      >
                        <Link href={slide.href}>
                          {slide.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm font-medium"
                      >
                        <Link href="/categorias">Explorar Categorías</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm" />
          <CarouselNext className="right-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm" />
        </div>
      </Carousel>
    </section>
  );
}
