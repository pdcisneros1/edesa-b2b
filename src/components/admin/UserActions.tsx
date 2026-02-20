'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Ban, Trash2, ShieldCheck } from 'lucide-react';

interface UserActionsProps {
  userId: string;
  isApproved: boolean;
  isBlocked: boolean;
  role: string;
}

export function UserActions({ userId, isApproved, isBlocked, role }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const update = async (data: Record<string, unknown>, label: string) => {
    setLoading(label);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(`Usuario ${label} correctamente`);
      router.refresh();
    } catch {
      toast.error('Error al actualizar usuario');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setLoading('eliminando');
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Usuario eliminado');
      router.push('/admin/usuarios');
    } catch {
      toast.error('Error al eliminar usuario');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Status indicator */}
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm">
        <p className="text-gray-500 text-xs mb-1">Estado actual</p>
        <p className="font-medium text-gray-900">
          {isBlocked ? '🔴 Bloqueado' : isApproved ? '🟢 Activo' : '🟡 Pendiente'}
        </p>
      </div>

      {isBlocked ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-green-700 border-green-200 hover:bg-green-50"
          onClick={() => update({ isBlocked: false, isApproved: true }, 'desbloqueado')}
          disabled={loading !== null}
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading === 'desbloqueado' ? 'Aplicando...' : 'Desbloquear'}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-red-700 border-red-200 hover:bg-red-50"
          onClick={() => update({ isBlocked: true }, 'bloqueado')}
          disabled={loading !== null}
        >
          <Ban className="h-4 w-4" />
          {loading === 'bloqueado' ? 'Aplicando...' : 'Bloquear acceso'}
        </Button>
      )}

      {!isApproved && !isBlocked && (
        <Button
          size="sm"
          className="w-full gap-2"
          onClick={() => update({ isApproved: true }, 'aprobado')}
          disabled={loading !== null}
        >
          <ShieldCheck className="h-4 w-4" />
          {loading === 'aprobado' ? 'Aplicando...' : 'Aprobar cliente'}
        </Button>
      )}

      {/* Don't allow deleting admin users */}
      {role !== 'admin' && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleDelete}
          disabled={loading !== null}
        >
          <Trash2 className="h-4 w-4" />
          {loading === 'eliminando' ? 'Eliminando...' : 'Eliminar usuario'}
        </Button>
      )}

      <p className="text-xs text-gray-400 text-center pt-1">
        Los cambios se aplican de inmediato.
      </p>
    </div>
  );
}
