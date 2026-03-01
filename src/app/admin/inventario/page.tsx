import { InventarioSimple } from '@/components/admin/inventario/InventarioSimple';

// Forzar renderizado dinámico (no estático)
export const dynamic = 'force-dynamic';

export default async function InventarioPage() {
  return <InventarioSimple />;
}
