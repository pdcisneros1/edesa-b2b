'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    title: 'Productos de Calidad Premium',
    description: 'Encuentra las mejores marcas en sanitarios, griferías y acabados para tu proyecto',
    cta: 'Ver Productos',
    href: '/productos',
    bgColor: 'bg-gradient-to-r from-primary/90 to-primary',
  },
  {
    id: 2,
    title: 'Nuevos Productos en Stock',
    description: 'Descubre nuestra última colección de lavamanos y accesorios modernos',
    cta: 'Ver Novedades',
    href: '/productos?new=true',
    bgColor: 'bg-gradient-to-r from-secondary/90 to-secondary',
  },
  {
    id: 3,
    title: 'Ofertas Especiales',
    description: 'Aprovecha descuentos en productos seleccionados de griferías y sanitarios',
    cta: 'Ver Ofertas',
    href: '/productos?featured=true',
    bgColor: 'bg-gradient-to-r from-accent/90 to-accent',
  },
];

export function Hero() {
  return (
    <section className="w-full">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className={`relative overflow-hidden border-0 rounded-none sm:rounded-lg ${slide.bgColor} text-white`}>
                <div className="container py-20 md:py-32">
                  <div className="max-w-2xl space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90">
                      {slide.description}
                    </p>
                    <div className="flex gap-4">
                      <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="font-semibold"
                      >
                        <Link href={slide.href}>{slide.cta}</Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur"
                      >
                        <Link href="/categorias">Ver Categorías</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </div>
      </Carousel>
    </section>
  );
}
