import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limit: 3 solicitudes de reset por hora
const FORGOT_PASSWORD_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 3600, // 1 hora
};

export async function POST(request: NextRequest) {
  try {
    // 🔒 RATE LIMITING por IP
    const ip = getClientIp(request);
    const ipAllowed = await checkRateLimit(
      `forgot-password:ip:${ip}`,
      FORGOT_PASSWORD_RATE_LIMIT.maxRequests,
      FORGOT_PASSWORD_RATE_LIMIT.windowSeconds
    );

    if (!ipAllowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta nuevamente en 1 hora.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(FORGOT_PASSWORD_RATE_LIMIT.windowSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = body as { email: string };

    // Validar email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email (case insensitive)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Por seguridad, siempre retornar éxito (no revelar si el email existe)
    // Esto previene enumeration attacks
    const successMessage = {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un link de recuperación en los próximos minutos.',
    };

    // Si el usuario no existe, retornar éxito sin hacer nada
    if (!user) {
      console.log(`❌ Password reset solicitado para email no existente: ${email}`);
      return NextResponse.json(successMessage);
    }

    // Si el usuario está bloqueado, no enviar email
    if (user.isBlocked) {
      console.log(`❌ Password reset bloqueado para usuario bloqueado: ${email}`);
      return NextResponse.json(successMessage);
    }

    // Generar token único y seguro
    const resetToken = randomBytes(32).toString('hex');

    // Token expira en 1 hora
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 📧 Enviar email con link de reset
    try {
      const { sendPasswordResetEmail } = await import('@/lib/email');
      await sendPasswordResetEmail(user.email, resetToken, user.name || 'Usuario');
      console.log(`✅ Email de reset de contraseña enviado a: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Error al enviar email de reset:', emailError);
      // No fallar la solicitud si el email falla - el token está guardado en DB
    }

    return NextResponse.json(successMessage);
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
