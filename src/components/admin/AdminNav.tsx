'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  LogOut,
  Home,
  FileText,
  ShoppingBag,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Categorías', href: '/admin/categorias', icon: FolderTree },
  { name: 'Marcas', href: '/admin/marcas', icon: Tag },
  { name: 'Compras', href: '/admin/purchases', icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });

      if (res.ok) {
        toast.success('Sesión cerrada exitosamente');
        router.push('/admin/login');
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white font-extrabold text-sm">
                E
              </div>
              <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:block">
                Admin
              </span>
            </Link>
            <div className="hidden h-4 w-px bg-gray-200 sm:block" />

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-500 hover:text-gray-700 text-sm h-8"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ver tienda</span>
                <ChevronRight className="h-3 w-3 hidden sm:inline" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? 'Cerrando...' : 'Salir'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
