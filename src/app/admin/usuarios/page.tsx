import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { UsuariosHeader } from '@/components/admin/usuarios/UsuariosHeader';

export const dynamic = 'force-dynamic';

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    staff: 'bg-blue-100 text-blue-700',
    cliente: 'bg-green-100 text-green-700',
  };
  const labels: Record<string, string> = {
    admin: 'Admin', staff: 'Staff', cliente: 'Ferretería',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[role] ?? role}
    </span>
  );
}

function StatusBadge({ isBlocked, isApproved }: { isBlocked?: boolean | null; isApproved?: boolean | null }) {
  if (isBlocked) {
    return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">Bloqueado</span>;
  }
  if (isApproved === false) {
    return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">Pendiente</span>;
  }
  return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">Activo</span>;
}

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, role: true,
      company: true, ruc: true, phone: true,
      isApproved: true, isBlocked: true, createdAt: true,
    },
  });

  const clientes = users.filter((u) => u.role === 'cliente');
  const admins = users.filter((u) => u.role !== 'cliente');

  return (
    <div className="space-y-5">
      {/* Header */}
      <UsuariosHeader users={users} />

      {users.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-gray-100 p-5 mb-4">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Sin usuarios</h2>
          <p className="text-xs text-gray-400">Los usuarios aparecerán aquí automáticamente.</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Usuario', 'Empresa / RUC', 'Rol', 'Estado', 'Teléfono', ''].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{user.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      {user.company ? (
                        <>
                          <p className="text-sm text-gray-900">{user.company}</p>
                          <p className="text-xs text-gray-400 font-mono">{user.ruc ?? '—'}</p>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge isBlocked={user.isBlocked} isApproved={user.isApproved} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{user.phone ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/usuarios/${user.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Gestionar <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
