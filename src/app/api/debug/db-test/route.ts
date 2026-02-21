import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Test 1: Verificar conexión a la base de datos
    await prisma.$connect();

    // Test 2: Contar usuarios
    const userCount = await prisma.user.count();

    // Test 3: Buscar admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@edesaventas.ec' },
      select: { id: true, email: true, role: true, isBlocked: true, password: true }
    });

    // Test 4: Probar bcrypt con la contraseña
    let bcryptTest: any = { available: false };
    if (adminUser?.password) {
      try {
        const testPassword = 'Admin123!';
        const isValid = await bcrypt.compare(testPassword, adminUser.password);
        bcryptTest = {
          available: true,
          passwordMatches: isValid,
          hashedPasswordPrefix: adminUser.password.substring(0, 10) + '...'
        };
      } catch (bcryptError: any) {
        bcryptTest = {
          available: true,
          error: bcryptError.message
        };
      }
    }

    // Test 5: Variables de entorno
    const envCheck = {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
    };

    // Remover password del resultado
    const adminUserSafe = adminUser ? {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isBlocked: adminUser.isBlocked
    } : null;

    return NextResponse.json({
      success: true,
      dbConnected: true,
      userCount,
      adminUser: adminUserSafe,
      bcryptTest,
      envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
