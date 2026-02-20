'use client';

import Link from 'next/link';
import { Lock, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calculateDiscount } from '@/lib/format';
import { Badge } from '@/components/ui/badge';

interface PriceGateProps {
  price: number;
  wholesalePrice?: number | null;
  compareAtPrice?: number | null;
  /** Variante compacta para tarjetas de producto */
  compact?: boolean;
  /** Ruta de retorno después del login */
  redirectAfterLogin?: string;
}

export function PriceGate({
  price,
  wholesalePrice,
  compareAtPrice,
  compact = false,
  redirectAfterLogin,
}: PriceGateProps) {
  const { canSeePrices } = useAuth();

  // Usuario NO autenticado: mostrar CTA de login
  if (!canSeePrices) {
    const loginHref = redirectAfterLogin
      ? `/login?redirect=${encodeURIComponent(redirectAfterLogin)}`
      : '/login';

    if (compact) {
      return (
        <Link
          href={loginHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Lock className="h-3 w-3 flex-shrink-0" />
          Ver precio mayorista
        </Link>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex-shrink-0 rounded-full bg-amber-100 p-2 mt-0.5">
            <Store className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">
              Precios exclusivos para ferreterías
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Inicia sesión para ver nuestros precios mayoristas y agregar al carrito.
            </p>
          </div>
        </div>
        <Link
          href={loginHref}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Lock className="h-4 w-4" />
          Ingresar como ferretería
        </Link>
      </div>
    );
  }

  // Usuario autenticado: mostrar precio correspondiente
  // Prioridad: precio mayorista > precio regular
  const effectivePrice = (wholesalePrice && wholesalePrice > 0) ? wholesalePrice : price;
  const isWholesale = !!(wholesalePrice && wholesalePrice > 0 && wholesalePrice !== price);
  const hasCompare = !isWholesale && compareAtPrice && compareAtPrice > price;
  const discount = hasCompare ? calculateDiscount(price, compareAtPrice!) : 0;

  if (compact) {
    return (
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-extrabold text-gray-900">
            {formatPrice(effectivePrice)}
          </span>
          {isWholesale && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>
          )}
          {hasCompare && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(compareAtPrice!)}</span>
          )}
        </div>
        {isWholesale && (
          <p className="text-[11px] font-bold text-primary flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Precio mayorista
          </p>
        )}
        {hasCompare && discount > 0 && (
          <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
            Ahorra {discount}%
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl font-extrabold text-gray-900">
          {formatPrice(effectivePrice)}
        </span>
        {isWholesale && (
          <span className="text-base text-gray-400 line-through">{formatPrice(price)}</span>
        )}
        {hasCompare && (
          <>
            <span className="text-base text-gray-400 line-through">{formatPrice(compareAtPrice!)}</span>
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
            )}
          </>
        )}
      </div>
      {isWholesale && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1">
          <Store className="h-3 w-3 text-primary" />
          <span className="text-xs font-bold text-primary">Precio mayorista ferretería</span>
        </div>
      )}
    </div>
  );
}
