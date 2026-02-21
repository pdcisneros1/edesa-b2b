import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test 1: Verificar conexión a la base de datos
    await prisma.$connect();

    // Test 2: Contar usuarios
    const userCount = await prisma.user.count();

    // Test 3: Buscar admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@edesaventas.ec' },
      select: { id: true, email: true, role: true, isBlocked: true }
    });

    // Test 4: Variables de entorno
    const envCheck = {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      success: true,
      dbConnected: true,
      userCount,
      adminUser,
      envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
