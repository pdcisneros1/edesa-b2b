'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({
  productId,
  productName = 'Producto',
  className = '',
  size = 'md',
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Tamaños del ícono
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Verificar si está en favoritos al montar
  useEffect(() => {
    if (!isAuthenticated) {
      setIsChecking(false);
      return;
    }

    const checkWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();
        setInWishlist(data.inWishlist);
      } catch (error) {
        console.error('Error verificando wishlist:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWishlist();
  }, [productId, isAuthenticated]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir navegación si está dentro de un Link
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Inicia sesión para guardar favoritos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        setInWishlist(data.inWishlist);

        if (data.action === 'added') {
          toast.success(`❤️ ${productName} agregado a favoritos`);
        } else {
          toast.info(`💔 ${productName} removido de favoritos`);
        }
      } else {
        toast.error(data.error || 'Error al actualizar favoritos');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  // No mostrar si no está autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Mostrar loading state
  if (isChecking) {
    return (
      <button
        disabled
        className={`flex items-center justify-center rounded-full transition-all ${className}`}
        aria-label="Cargando..."
      >
        <Heart className={`${iconSizes[size]} text-gray-300 animate-pulse`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      aria-label={inWishlist ? 'Remover de favoritos' : 'Agregar a favoritos'}
      title={inWishlist ? 'Remover de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        className={`${iconSizes[size]} transition-all duration-200 ${
          inWishlist
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-500'
        }`}
      />
    </button>
  );
}
