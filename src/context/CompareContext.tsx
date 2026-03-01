'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  wholesalePrice?: number | null;
  images?: Array<{ url: string; alt?: string | null }>;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  stock: number;
  shortDescription?: string | null;
}

interface CompareContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isComparing: (productId: string) => boolean;
  canAddMore: boolean;
  count: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 4;
const STORAGE_KEY = 'edesa-compare-products';

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
      } catch (error) {
        console.error('Failed to parse compare products:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isInitialized]);

  const addProduct = (product: Product) => {
    if (products.length >= MAX_COMPARE) return;
    if (products.some((p) => p.id === product.id)) return;
    setProducts([...products, product]);
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const clearAll = () => {
    setProducts([]);
  };

  const isComparing = (productId: string) => {
    return products.some((p) => p.id === productId);
  };

  const canAddMore = products.length < MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{
        products,
        addProduct,
        removeProduct,
        clearAll,
        isComparing,
        canAddMore,
        count: products.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
