'use client';

import { useCompare } from '@/context/CompareContext';
import { GitCompare, X } from 'lucide-react';
import { useState } from 'react';
import { CompareModal } from './CompareModal';

export function CompareFloatingButton() {
  const { products, count, clearAll } = useCompare();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (count === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Comparando {count} {count === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <button
              onClick={clearAll}
              className="hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Limpiar comparación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Products preview */}
          <div className="p-3 bg-gray-50 max-w-xs">
            <div className="flex gap-2 mb-3">
              {products.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 truncate flex-1"
                  title={product.name}
                >
                  {product.name.slice(0, 20)}...
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Ver comparación
            </button>
          </div>
        </div>
      </div>

      <CompareModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
