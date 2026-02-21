'use client';

import { useState } from 'react';
import { PromotionProductSelector } from '@/components/admin/promociones/PromotionProductSelector';

export default function TestSelectorPage() {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test: PromotionProductSelector</h1>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="font-medium text-yellow-900">⚠️ Test Crítico:</p>
        <p className="text-sm text-yellow-800 mt-2">
          Si esta página te expulsa inmediatamente después de cargar,
          el problema está en PromotionProductSelector (fetch de productos)
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <PromotionProductSelector
          selectedProductIds={selectedProductIds}
          onChange={setSelectedProductIds}
        />
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <p className="font-medium text-green-900">✅ Si ves esto:</p>
        <p className="text-sm text-green-800 mt-2">
          El PromotionProductSelector NO es el problema. Buscar en otro lado.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Productos seleccionados: {selectedProductIds.length}
        </p>
      </div>
    </div>
  );
}
