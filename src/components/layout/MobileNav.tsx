'use client';

import Link from 'next/link';
import { Home, Package, Grid, Info, Mail, ChevronRight } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { getMainCategories } from '@/data/mock-categories';

export function MobileNav() {
  const mainCategories = getMainCategories();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl mb-2">
          E
        </div>
        <h2 className="font-bold text-lg">{SITE_NAME}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>
          <Link
            href="/productos"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Package className="h-5 w-5" />
            Productos
          </Link>
          <Link
            href="/categorias"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Grid className="h-5 w-5" />
            Categorías
          </Link>
          <Link
            href="/nosotros"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Info className="h-5 w-5" />
            Nosotros
          </Link>
          <Link
            href="/contacto"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Mail className="h-5 w-5" />
            Contacto
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Categories */}
        <div className="px-3">
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Categorías Principales
          </h3>
          <div className="space-y-1">
            {mainCategories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>{category.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
