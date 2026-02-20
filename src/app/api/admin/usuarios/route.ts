import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { adminCreateUserSchema } from '@/lib/validators';

// GET /api/admin/usuarios — lista todos los usuarios (solo admin)
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, role: true,
      company: true, ruc: true, phone: true,
      isApproved: true, isBlocked: true, createdAt: true,
      // NUNCA incluir: password, passwordHash, tokens internos
    },
  });

  return NextResponse.json({ users });
}

// POST /api/admin/usuarios — crear usuario (solo admin)
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const parsed = adminCreateUserSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, role, company, ruc, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase(),
        password: passwordHash,
        role: role ?? 'cliente',
        company: company?.trim() || null,
        ruc: ruc?.trim() || null,
        phone: phone?.trim() || null,
        isApproved: true,
        isBlocked: false,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
