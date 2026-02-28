import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateCsrfToken, setCsrfCookie, deleteCsrfCookie } from './csrf';

// ─── Validación de secreto JWT al inicio ─────────────────────────────────────

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}
if (secretKey.length < 32) {
  throw new Error(
    'JWT_SECRET debe tener al menos 32 caracteres para garantizar seguridad criptográfica'
  );
}
const key = new TextEncoder().encode(secretKey);

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ClientType = 'admin' | 'ferreteria' | 'minorista';

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  name?: string | null;
  clientType?: ClientType;
  /**
   * true = cliente aprobado para comprar.
   * Por defecto true para todos. Arquitectura lista para aprobación manual futura.
   */
  clienteAprobado?: boolean;
  expiresAt: Date;
};

// ─── JWT helpers ──────────────────────────────────────────────────────────────

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    // Verificar que el payload contiene los campos requeridos
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    // Token expirado, firma inválida, etc. — no exponer detalles del error
    return null;
  }
}

// ─── Session management ───────────────────────────────────────────────────────

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Usuario no encontrado');

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    clientType: 'ferreteria',
    clienteAprobado: true, // auto-aprobado; futura: leer de DB para validación manual
    expiresAt,
  };

  const token = await encrypt(session);
  const cookieStore = await cookies();

  // Establecer cookie de sesión JWT
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  // 🔒 CSRF Protection: Generar y establecer token CSRF
  const csrfToken = generateCsrfToken();
  await setCsrfCookie(csrfToken, expiresAt);
}

/**
 * Obtiene la sesión del usuario desde la cookie.
 * Si la cookie existe pero el token es inválido/expirado, elimina la cookie
 * para evitar que sesiones corruptas persistan.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  const session = await decrypt(token);

  // Si el token existe pero es inválido/expirado, limpiar la cookie
  if (!session) {
    try {
      cookieStore.delete('session');
    } catch {
      // En algunos contextos (streaming) no se puede modificar cookies — ignorar
    }
    return null;
  }

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');

  // 🔒 CSRF Protection: Eliminar también el token CSRF
  await deleteCsrfCookie();
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

// ─── Credential verification ──────────────────────────────────────────────────

/**
 * Verifica credenciales contra la base de datos.
 * Usa bcrypt.compare() para comparación en tiempo constante (previene timing attacks).
 * Retorna null tanto si el usuario no existe como si la contraseña es incorrecta
 * (mensaje genérico para prevenir user enumeration).
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ id: string } | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) return null;
  if (user.isBlocked) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return { id: user.id };
}

// ─── API route middleware helpers ─────────────────────────────────────────────

/**
 * Verifica autenticación en rutas API.
 * Retorna { authenticated: true, session } o { authenticated: false, session: null }.
 */
export async function requireAuth(request: NextRequest) {
  const cookieStore = request.cookies;
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return { authenticated: false, session: null };
  }

  const session = await decrypt(token);

  if (!session) {
    return { authenticated: false, session: null };
  }

  return { authenticated: true, session };
}

/**
 * Verifica autenticación + rol admin en rutas API.
 * Retorna { authorized: true, session } o { authorized: false, response } con el
 * NextResponse apropiado (401 o 403).
 */
export async function requireAdmin(request: NextRequest): Promise<
  | { authorized: true; session: SessionPayload }
  | { authorized: false; response: NextResponse }
> {
  const { authenticated, session } = await requireAuth(request);

  if (!authenticated || !session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    };
  }

  if (session.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }),
    };
  }

  return { authorized: true, session };
}
