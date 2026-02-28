import { InventarioDashboardClient } from '@/components/admin/inventario/InventarioDashboardClient';

// Forzar renderizado dinámico (no estático)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inventario Inteligente | Admin',
  description: 'Gestión inteligente de inventario con predicción de demanda',
};

export default async function InventarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventario Inteligente</h1>
        <p className="text-muted-foreground mt-1">
          Predicción de demanda y gestión automática de reabastecimiento
        </p>
      </div>

      <InventarioDashboardClient />
    </div>
  );
}
