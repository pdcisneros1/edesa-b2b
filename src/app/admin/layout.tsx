import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Solo el rol 'admin' puede acceder al panel — cualquier otro rol es redirigido
  if (session.role !== 'admin') {
    redirect('/cuenta');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
