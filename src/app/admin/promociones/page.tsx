'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PromotionsTable } from '@/components/admin/promociones/PromotionsTable';
import { ExportButton } from '@/components/admin/ExportButton';
import { Promotion } from '@/types/promotion';

export default function PromocionesPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<
    (Promotion & { products: { id: string; productId: string }[] })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promociones');
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      } else {
        console.error('Error fetching promotions');
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/promociones/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPromotions();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la promoción');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Error al eliminar la promoción');
    }
  };

  const handleToggleActive = async (id: string, isManuallyDisabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/promociones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isManuallyDisabled }),
      });

      if (res.ok) {
        fetchPromotions();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar la promoción');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      alert('Error al actualizar la promoción');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Promociones</h1>
            <p className="text-muted-foreground">
              Gestiona descuentos y ofertas especiales para productos
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // Preparar datos para exportación
  const exportData = promotions.map((promo) => ({
    nombre: promo.name,
    descripcion: promo.description || '',
    tipoDescuento: promo.discountType === 'percentage' ? 'Porcentaje' : 'Monto Fijo',
    valorDescuento: promo.discountValue,
    fechaInicio: promo.validFrom ? new Date(promo.validFrom).toLocaleDateString('es-EC') : '-',
    fechaFin: promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('es-EC') : '-',
    diasActivacion: promo.daysFromActivation || '-',
    productos: promo.products.length,
    activa: promo.isActive ? 'Sí' : 'No',
    desactivadaManual: promo.isManuallyDisabled ? 'Sí' : 'No',
  }));

  const exportColumns = [
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Tipo Descuento', dataKey: 'tipoDescuento' },
    { header: 'Valor', dataKey: 'valorDescuento' },
    { header: 'Fecha Inicio', dataKey: 'fechaInicio' },
    { header: 'Fecha Fin', dataKey: 'fechaFin' },
    { header: 'Días Activación', dataKey: 'diasActivacion' },
    { header: '# Productos', dataKey: 'productos' },
    { header: 'Activa', dataKey: 'activa' },
    { header: 'Desactivada Manual', dataKey: 'desactivadaManual' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promociones</h1>
          <p className="text-muted-foreground">
            Gestiona descuentos y ofertas especiales para productos
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={exportData}
            filename="promociones"
            columns={exportColumns}
            title="Reporte de Promociones"
          />
          <Button onClick={() => router.push('/admin/promociones/nueva')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Promoción
          </Button>
        </div>
      </div>

      <PromotionsTable
        promotions={promotions}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
