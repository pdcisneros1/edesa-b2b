'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Menu, Phone, MessageCircle, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SITE_NAME, CONTACT_INFO } from '@/lib/constants';
import { MobileNav } from './MobileNav';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

export function Header({ categories = [] }: { categories?: NavCategory[] }) {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-gray-900 text-white">
        <div className="container flex h-9 items-center justify-between text-xs">
          <p className="hidden md:block text-gray-400">
            Distribución a ferreterías y sub-distribuidores en Ecuador
          </p>
          <div className="flex items-center gap-5 ml-auto">
            <a
              href="https://wa.me/593992686411?text=Hola%2C%20necesito%20información%20sobre%20productos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{CONTACT_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container flex h-16 items-center gap-3 md:gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 flex-shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <MobileNav categories={categories} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg shadow-sm">
              E
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-extrabold text-gray-900 text-base tracking-tight">{SITE_NAME}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Ecuador</span>
            </div>
          </Link>

          {/* Central search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 hidden md:flex">
            <div className="relative w-full flex shadow-sm rounded-lg overflow-hidden border border-gray-200 focus-within:border-primary/40 focus-within:shadow-md transition-all">
              <Input
                type="search"
                placeholder="Buscar productos, marcas, categorías..."
                className="rounded-none border-0 h-10 pl-4 text-sm bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="flex items-center justify-center w-12 h-10 bg-primary hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 ml-auto">
            {isAuthenticated ? (
              <Link href="/cuenta">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium">Mi Cuenta</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-xs font-medium">Ingresar</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="hidden sm:flex gap-1.5 px-3 text-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Regístrate
                  </Button>
                </Link>
              </>
            )}

            <Link href="/carrito">
              <Button
                variant="ghost"
                size="sm"
                className="relative flex gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white leading-none">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-medium">Carrito</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="bg-white border-b border-gray-100 hidden lg:block">
        <div className="container">
          <nav className="flex items-center gap-6 h-10 text-sm overflow-x-auto">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/productos', label: 'Todos los Productos' },
              { href: '/categorias', label: 'Categorías' },
              { href: '/nosotros', label: 'Nosotros' },
              { href: '/contacto', label: 'Contacto' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap py-2 border-b-2 border-transparent hover:border-primary/40"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile search */}
      <div className="bg-white border-b border-gray-200 px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:border-primary/40">
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="rounded-none border-0 h-9 text-sm bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center justify-center w-10 h-9 bg-primary flex-shrink-0"
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
