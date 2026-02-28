import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';
import { checkRateLimit, resetRateLimit, getClientIp, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 🔒 RATE LIMITING: Extraer IP del cliente
    const ip = getClientIp(request);

    // 🔒 RATE LIMITING: Verificar límite por IP (5 intentos en 15 minutos)
    const ipAllowed = await checkRateLimit(
      `login:ip:${ip}`,
      LOGIN_RATE_LIMIT.maxRequests,
      LOGIN_RATE_LIMIT.windowSeconds
    );

    if (!ipAllowed) {
      const retryAfterMinutes = Math.ceil(LOGIN_RATE_LIMIT.windowSeconds / 60);
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta nuevamente más tarde.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterMinutes * 60),
            'X-RateLimit-Limit': String(LOGIN_RATE_LIMIT.maxRequests),
            'X-RateLimit-Window': String(LOGIN_RATE_LIMIT.windowSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const email: string = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password: string = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // 🔒 RATE LIMITING: Verificar límite adicional por email
    // Previene ataques dirigidos a una cuenta específica
    const emailAllowed = await checkRateLimit(
      `login:email:${email}`,
      LOGIN_RATE_LIMIT.maxRequests,
      LOGIN_RATE_LIMIT.windowSeconds
    );

    if (!emailAllowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta nuevamente más tarde.' },
        { status: 429 }
      );
    }

    const result = await verifyCredentials(email, password);

    if (!result) {
      // Mensaje genérico — no revelar si el email existe o la contraseña es incorrecta
      return NextResponse.json(
        { error: 'Credenciales inválidas o cuenta bloqueada' },
        { status: 401 }
      );
    }

    // ✅ Login exitoso: limpiar contadores de rate limit
    await resetRateLimit(`login:ip:${ip}`);
    await resetRateLimit(`login:email:${email}`);

    await createSession(result.id);

    return NextResponse.json(
      { success: true, message: 'Sesión iniciada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
