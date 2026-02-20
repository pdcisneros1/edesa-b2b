import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/admin/usuarios/[id] — update user (approve/block/edit)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const { id } = await params;
  const body = await request.json();
  const { name, company, ruc, phone, isApproved, isBlocked } = body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(company !== undefined && { company }),
        ...(ruc !== undefined && { ruc }),
        ...(phone !== undefined && { phone }),
        ...(isApproved !== undefined && { isApproved }),
        ...(isBlocked !== undefined && { isBlocked }),
      },
      select: {
        id: true, email: true, name: true, role: true,
        company: true, ruc: true, phone: true,
        isApproved: true, isBlocked: true,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
}

// DELETE /api/admin/usuarios/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
}
