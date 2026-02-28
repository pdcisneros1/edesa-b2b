import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

/**
 * Endpoint de debug para verificar variables de entorno
 * Solo accesible para admin
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const envVars = {
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || '❌ NO CONFIGURADO',
    SMTP_HOST: process.env.SMTP_HOST || '❌ NO CONFIGURADO',
    SMTP_PORT: process.env.SMTP_PORT || '❌ NO CONFIGURADO',
    SMTP_USER: process.env.SMTP_USER || '❌ NO CONFIGURADO',
    SMTP_PASS: process.env.SMTP_PASS ? '✅ CONFIGURADO (oculto)' : '❌ NO CONFIGURADO',
    EMAIL_FROM: process.env.EMAIL_FROM || '❌ NO CONFIGURADO',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ CONFIGURADO (oculto)' : '❌ NO CONFIGURADO',
  };

  return NextResponse.json({
    message: 'Variables de entorno para emails',
    env: envVars,
    timestamp: new Date().toISOString(),
  });
}
