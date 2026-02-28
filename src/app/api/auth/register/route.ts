import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, REGISTER_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // 🔒 RATE LIMITING: 3 registros por hora por IP
  const ip = getClientIp(request);
  const ipAllowed = await checkRateLimit(
    `register:ip:${ip}`,
    REGISTER_RATE_LIMIT.maxRequests,
    REGISTER_RATE_LIMIT.windowSeconds
  );

  if (!ipAllowed) {
    const retryAfterMinutes = Math.ceil(REGISTER_RATE_LIMIT.windowSeconds / 60);
    return NextResponse.json(
      { error: 'Demasiadas solicitudes de registro. Intenta nuevamente más tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(REGISTER_RATE_LIMIT.windowSeconds),
          'X-RateLimit-Limit': String(REGISTER_RATE_LIMIT.maxRequests),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { firstName, lastName, company, ruc, phone, email, password } = parsed.data;

    // Verificar si el email ya está registrado
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.toLowerCase(),
        password: passwordHash,
        role: 'cliente',
        company: company.trim(),
        ruc: ruc.trim(),
        phone: phone.trim(),
        isApproved: true,
        isBlocked: false,
      },
    });

    // Auto-login tras registro
    await createSession(user.id);

    // 📧 Enviar email de bienvenida (no bloquear la respuesta)
    try {
      const { sendWelcomeEmail } = await import('@/lib/email');
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('❌ Error al enviar email de bienvenida:', emailError);
      // No fallar el registro si el email falla
    }

    return NextResponse.json(
      { success: true, message: 'Registro exitoso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error en el servidor. Intenta nuevamente.' }, { status: 500 });
  }
}
