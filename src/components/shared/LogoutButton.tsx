'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Sesión cerrada correctamente');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
