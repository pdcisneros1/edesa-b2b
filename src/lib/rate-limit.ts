/**
 * ============================================================================
 * RATE LIMITING CON UPSTASH REDIS
 * ============================================================================
 *
 * Sistema de rate limiting profesional usando Upstash Redis con ventana
 * deslizante (sliding window) para control preciso de requests.
 *
 * Características:
 * - Ventana deslizante para evitar "burst" attacks al final de ventanas fijas
 * - Persistencia en Redis (funciona en multi-instance/serverless)
 * - Límites por IP, email, o cualquier identificador
 * - Compatible con Vercel Edge Functions
 *
 * Variables de entorno requeridas:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * ============================================================================
 */

import { Redis } from '@upstash/redis';

// Cliente Redis singleton
let redisClient: Redis | null = null;

/**
 * Obtiene o crea el cliente Redis usando REST API de Upstash.
 * Singleton pattern para reutilizar la conexión.
 */
function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '⚠️  Redis credentials no configuradas. Rate limiting deshabilitado. ' +
      'Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en .env'
    );
    return null;
  }

  try {
    redisClient = new Redis({
      url,
      token,
    });
    return redisClient;
  } catch (error) {
    console.error('❌ Error al conectar con Upstash Redis:', error);
    return null;
  }
}

/**
 * Verifica si un identificador ha excedido el límite de rate.
 *
 * Algoritmo de ventana deslizante:
 * 1. Guarda timestamps de cada request en un sorted set (ZADD)
 * 2. Elimina timestamps fuera de la ventana (ZREMRANGEBYSCORE)
 * 3. Cuenta requests en la ventana actual (ZCARD)
 * 4. Si excede límite, retorna false; si no, retorna true
 *
 * @param identifier - Identificador único (IP, email, userId, etc.)
 * @param limit - Número máximo de requests permitidos
 * @param windowSeconds - Tamaño de la ventana en segundos
 * @returns true si está dentro del límite, false si excede
 *
 * @example
 * const allowed = await checkRateLimit('192.168.1.1', 5, 900); // 5 requests en 15 min
 * if (!allowed) {
 *   return res.status(429).json({ error: 'Too many requests' });
 * }
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const redis = getRedisClient();

  // Si Redis no está disponible, permitir el request (fail-open)
  // En producción, considera fail-closed (return false) para mayor seguridad
  if (!redis) {
    return true;
  }

  try {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;
    const key = `ratelimit:${identifier}`;

    // Pipeline de comandos Redis para atomicidad
    const pipeline = redis.pipeline();

    // 1. Eliminar timestamps fuera de la ventana
    pipeline.zremrangebyscore(key, 0, windowStart);

    // 2. Contar requests en la ventana actual
    pipeline.zcard(key);

    // 3. Agregar el timestamp actual (optimista - se elimina si excede)
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });

    // 4. Establecer TTL para auto-limpieza (ventana + 1 hora de margen)
    pipeline.expire(key, windowSeconds + 3600);

    const results = await pipeline.exec();

    // results[1] contiene el count ANTES de agregar el nuevo timestamp
    const currentCount = (results[1] as number) || 0;

    // Si ya está en el límite o lo excede, eliminar el timestamp que acabamos de agregar
    if (currentCount >= limit) {
      // Eliminar el último timestamp agregado
      await redis.zremrangebyrank(key, -1, -1);
      return false; // Excede el límite
    }

    return true; // Dentro del límite
  } catch (error) {
    console.error('❌ Error en rate limiting:', error);
    // En caso de error, permitir el request (fail-open)
    return true;
  }
}

/**
 * Reinicia el rate limit para un identificador.
 * Útil después de un login exitoso para limpiar intentos fallidos.
 *
 * @param identifier - Identificador a reiniciar
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `ratelimit:${identifier}`;
    await redis.del(key);
  } catch (error) {
    console.error('❌ Error al reiniciar rate limit:', error);
  }
}

/**
 * Obtiene información sobre el rate limit actual de un identificador.
 *
 * @param identifier - Identificador a consultar
 * @param windowSeconds - Tamaño de la ventana en segundos
 * @returns Objeto con información del rate limit
 */
export async function getRateLimitInfo(
  identifier: string,
  windowSeconds: number
): Promise<{
  count: number;
  remaining: number;
  resetAt: Date;
} | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;
    const key = `ratelimit:${identifier}`;

    // Limpiar y contar
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    // Obtener el timestamp más antiguo para calcular resetAt
    const oldestTimestamps = await redis.zrange<Array<{ score: number; member: string }>>(
      key,
      0,
      0,
      { withScores: true }
    );
    const oldestTimestamp = (oldestTimestamps && oldestTimestamps[0]?.score) || now;
    const resetAt = new Date(oldestTimestamp + windowMs);

    return {
      count,
      remaining: Math.max(0, count),
      resetAt,
    };
  } catch (error) {
    console.error('❌ Error al obtener info de rate limit:', error);
    return null;
  }
}

// ─── CONFIGURACIONES PREDEFINIDAS ────────────────────────────────────────────

/**
 * Configuración para login:
 * - 5 intentos máximo
 * - Ventana de 15 minutos (900 segundos)
 */
export const LOGIN_RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 15 * 60, // 900 segundos = 15 minutos
} as const;

/**
 * Configuración para registro:
 * - 3 intentos máximo
 * - Ventana de 1 hora (3600 segundos)
 */
export const REGISTER_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 60 * 60, // 3600 segundos = 1 hora
} as const;

/**
 * Configuración para checkout:
 * - 10 pedidos máximo
 * - Ventana de 1 hora (3600 segundos)
 */
export const CHECKOUT_RATE_LIMIT = {
  maxRequests: 10,
  windowSeconds: 60 * 60, // 3600 segundos = 1 hora
} as const;

/**
 * Configuración para operaciones generales de API:
 * - 100 requests máximo
 * - Ventana de 1 minuto (60 segundos)
 */
export const API_RATE_LIMIT = {
  maxRequests: 100,
  windowSeconds: 60, // 60 segundos = 1 minuto
} as const;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Extrae el IP real del request, respetando proxies de confianza (Vercel, Cloudflare).
 *
 * @param request - Request object (fetch API)
 * @returns IP address del cliente
 */
export function getClientIp(request: Request): string {
  // Vercel / Cloudflare envían el IP real en estos headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Puede ser "ip1, ip2, ip3" — el primero es el cliente original
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback para entornos locales
  return '127.0.0.1';
}

/**
 * Helper para aplicar rate limiting con respuesta estandarizada.
 *
 * @param identifier - Identificador (IP, email, etc.)
 * @param limit - Número máximo de requests
 * @param windowSeconds - Ventana en segundos
 * @returns null si permitido, Response con 429 si bloqueado
 *
 * @example
 * const rateLimit = await applyRateLimit(ip, 5, 900);
 * if (rateLimit) return rateLimit;
 */
export async function applyRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<Response | null> {
  const allowed = await checkRateLimit(identifier, limit, windowSeconds);

  if (!allowed) {
    const retryAfterSeconds = Math.ceil(windowSeconds / 60); // Estimación conservadora
    return new Response(
      JSON.stringify({
        error: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
        retryAfter: retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
