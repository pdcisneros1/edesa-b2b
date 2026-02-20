import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';
import { checkRateLimit, resetRateLimit, getClientIp, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Extraer IP para rate limiting
    const ip = getClientIp(request);

    // Verificar rate limit por IP
    const ipCheck = checkRateLimit(`login:ip:${ip}`, LOGIN_RATE_LIMIT);
    if (ipCheck.limited) {
      const retryAfterSecs = Math.ceil(ipCheck.retryAfterMs / 1000);
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta nuevamente más tarde.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSecs),
            'X-RateLimit-Reset': String(Date.now() + ipCheck.retryAfterMs),
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

    // Verificar rate limit adicional por email (previene ataques dirigidos a una cuenta específica)
    const emailCheck = checkRateLimit(`login:email:${email}`, LOGIN_RATE_LIMIT);
    if (emailCheck.limited) {
      const retryAfterSecs = Math.ceil(emailCheck.retryAfterMs / 1000);
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta nuevamente más tarde.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSecs) },
        }
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

    // Login exitoso: limpiar contadores de rate limit
    resetRateLimit(`login:ip:${ip}`);
    resetRateLimit(`login:email:${email}`);

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
