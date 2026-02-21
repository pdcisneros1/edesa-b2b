'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PromotionForm } from '@/components/admin/promociones/PromotionForm';
import { Promotion } from '@/types/promotion';

export default function EditPromocionPage() {
  const params = useParams();
  const id = params.id as string;
  const [promotion, setPromotion] = useState<
    (Promotion & { products: { id: string; productId: string }[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await fetch(`/api/admin/promociones/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPromotion(data);
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotion();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Editar Promoción</h1>
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Promoción no encontrada</h1>
        <p className="text-muted-foreground">
          La promoción que buscas no existe o ha sido eliminada.
        </p>
      </div>
    );
  }

  return <PromotionForm mode="edit" promotion={promotion} />;
}
