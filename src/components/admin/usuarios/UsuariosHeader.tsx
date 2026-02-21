'use client';

import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/admin/ExportButton';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  company?: string | null;
  ruc?: string | null;
  phone?: string | null;
  isApproved: boolean;
  isBlocked: boolean;
  createdAt: Date;
}

interface UsuariosHeaderProps {
  users: User[];
}

export function UsuariosHeader({ users }: UsuariosHeaderProps) {
  const router = useRouter();

  // Preparar datos para exportación
  const exportData = users.map((user) => ({
    nombre: user.name || '-',
    email: user.email,
    rol: user.role,
    empresa: user.company || '-',
    ruc: user.ruc || '-',
    telefono: user.phone || '-',
    aprobado: user.isApproved ? 'Sí' : 'No',
    bloqueado: user.isBlocked ? 'Sí' : 'No',
    fechaRegistro: new Date(user.createdAt).toLocaleDateString('es-EC'),
  }));

  const exportColumns = [
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Rol', dataKey: 'rol' },
    { header: 'Empresa', dataKey: 'empresa' },
    { header: 'RUC', dataKey: 'ruc' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Aprobado', dataKey: 'aprobado' },
    { header: 'Bloqueado', dataKey: 'bloqueado' },
    { header: 'Fecha Registro', dataKey: 'fechaRegistro' },
  ];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios, clientes y administradores
        </p>
      </div>
      <div className="flex gap-2">
        {users.length > 0 && (
          <ExportButton
            data={exportData}
            filename="usuarios"
            columns={exportColumns}
            title="Reporte de Usuarios"
          />
        )}
        <Button onClick={() => router.push('/admin/usuarios/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>
    </div>
  );
}
