'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { Promotion } from '@/types/promotion';
import { formatCurrency, formatDiscountPercentage } from '@/lib/format';
import { isPromotionValid } from '@/types/promotion';

interface PromotionsTableProps {
  promotions: (Promotion & { products: { id: string; productId: string }[] })[];
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string, isManuallyDisabled: boolean) => Promise<void>;
}

export function PromotionsTable({
  promotions,
  onDelete,
  onToggleActive,
}: PromotionsTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'disabled'>('all');

  const getPromotionStatus = (promotion: Promotion) => {
    if (promotion.isManuallyDisabled) {
      return 'disabled';
    }

    if (!promotion.isActive) {
      return 'inactive';
    }

    const now = new Date();

    // Programada (aún no inicia)
    if (promotion.validFrom && now < new Date(promotion.validFrom)) {
      return 'scheduled';
    }

    // Vencida
    if (promotion.validUntil && now > new Date(promotion.validUntil)) {
      return 'expired';
    }

    // Activa
    return 'active';
  };

  const getStatusBadge = (promotion: Promotion) => {
    const status = getPromotionStatus(promotion);

    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Activa</Badge>;
      case 'scheduled':
        return <Badge variant="default" className="bg-yellow-600">Programada</Badge>;
      case 'expired':
        return <Badge variant="destructive">Vencida</Badge>;
      case 'disabled':
        return <Badge variant="secondary">Desactivada</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactiva</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const formatValidityPeriod = (promotion: Promotion) => {
    const parts: string[] = [];

    if (promotion.validFrom || promotion.validUntil) {
      const from = promotion.validFrom
        ? new Date(promotion.validFrom).toLocaleDateString('es-EC')
        : 'Sin inicio';
      const until = promotion.validUntil
        ? new Date(promotion.validUntil).toLocaleDateString('es-EC')
        : 'Sin fin';
      parts.push(`${from} - ${until}`);
    }

    if (promotion.daysFromActivation) {
      parts.push(`${promotion.daysFromActivation} días desde activación`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Sin validez definida';
  };

  const filteredPromotions = promotions.filter((promo) => {
    const status = getPromotionStatus(promo);

    switch (filter) {
      case 'active':
        return status === 'active';
      case 'expired':
        return status === 'expired';
      case 'disabled':
        return status === 'disabled' || status === 'inactive';
      default:
        return true;
    }
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar la promoción "${name}"?`)) {
      await onDelete(id);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    const newState = !promotion.isManuallyDisabled;
    await onToggleActive(promotion.id, newState);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todas ({promotions.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          Activas ({promotions.filter((p) => getPromotionStatus(p) === 'active').length})
        </Button>
        <Button
          variant={filter === 'expired' ? 'default' : 'outline'}
          onClick={() => setFilter('expired')}
          size="sm"
        >
          Vencidas ({promotions.filter((p) => getPromotionStatus(p) === 'expired').length})
        </Button>
        <Button
          variant={filter === 'disabled' ? 'default' : 'outline'}
          onClick={() => setFilter('disabled')}
          size="sm"
        >
          Desactivadas (
          {
            promotions.filter(
              (p) => getPromotionStatus(p) === 'disabled' || getPromotionStatus(p) === 'inactive'
            ).length
          }
          )
        </Button>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo Descuento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Validez</TableHead>
              <TableHead className="text-center">Productos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay promociones {filter !== 'all' && `con filtro "${filter}"`}
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-medium">
                    {promotion.name}
                    {promotion.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {promotion.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {promotion.discountType === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {promotion.discountType === 'percentage'
                      ? `${promotion.discountValue}%`
                      : formatCurrency(promotion.discountValue)}
                  </TableCell>
                  <TableCell className="text-sm">{formatValidityPeriod(promotion)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{promotion.products.length}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(promotion)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/promociones/${promotion.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Ver/Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(promotion)}>
                          {promotion.isManuallyDisabled ? (
                            <>
                              <Power className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          ) : (
                            <>
                              <PowerOff className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(promotion.id, promotion.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
