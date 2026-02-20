import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  let categories: Array<{ id: string; name: string; slug: string }> = [];

  try {
    const results = await Promise.all([
      getSession(),
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, slug: true },
        take: 9,
      }),
    ]);
    session = results[0];
    categories = results[1];
  } catch (error) {
    console.error('Error loading layout data:', error);
    // Si falla Prisma o getSession, continúa con valores por defecto
    // El sitio seguirá funcionando sin categorías en el nav
  }

  return (
    <AuthProvider session={session}>
      <div className="relative flex min-h-screen flex-col">
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
