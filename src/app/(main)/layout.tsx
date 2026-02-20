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
  const [session, categories] = await Promise.all([
    getSession(),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true },
      take: 9,
    }),
  ]);

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
