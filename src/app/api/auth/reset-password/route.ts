import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limit: 5 intentos de reset por hora por IP
const RESET_PASSWORD_RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 3600, // 1 hora
};

export async function POST(request: NextRequest) {
  try {
    // 🔒 RATE LIMITING por IP
    const ip = getClientIp(request);
    const ipAllowed = await checkRateLimit(
      `reset-password:ip:${ip}`,
      RESET_PASSWORD_RATE_LIMIT.maxRequests,
      RESET_PASSWORD_RATE_LIMIT.windowSeconds
    );

    if (!ipAllowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta nuevamente en 1 hora.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(RESET_PASSWORD_RATE_LIMIT.windowSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

    // Validar token
    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        { error: 'La contraseña es demasiado larga' },
        { status: 400 }
      );
    }

    // Buscar usuario por token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Token no expirado
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado. Solicita un nuevo link de recuperación.' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no esté bloqueado
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Esta cuenta está bloqueada. Contacta al soporte.' },
        { status: 403 }
      );
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Actualizar contraseña y limpiar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log(`✅ Contraseña actualizada exitosamente para: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la contraseña. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
