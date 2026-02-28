-- ================================================
-- SEED MANUAL PARA EDESA VENTAS
-- Ejecuta esto en Supabase SQL Editor
-- ================================================

-- Este archivo te dice QUÉ hacer, pero el seed tiene que ejecutarse desde Node.js
-- porque lee el archivo JSON con 1740 productos

-- INSTRUCCIÓN: No uses este archivo directamente.
-- En su lugar, ejecuta el seed desde tu máquina local:

-- OPCIÓN 1: Desde terminal local
-- cd "/Users/pablocisneros/Desktop/PROYECTOS TRABAJO PROGRAMACION /EDESA VENTAS/edesa-ventas"
-- export DATABASE_URL='postgresql://postgres.qkusdnxvjycdsfiglfob:8QrxdFJ6BRNECaKD@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
-- npm run db:seed

-- OPCIÓN 2: Desde Vercel CLI (ejecutar en terminal)
-- vercel exec npm run db:seed

-- El seed creará:
-- - Admin user (admin@edesaventas.ec / Admin123!)
-- - 4 Categorías principales
-- - 4 Brands (EDESA, BRIGGS, SLOAN, EDESA PREMIUM)
-- - 1740 Productos desde prisma/seed-data.json
