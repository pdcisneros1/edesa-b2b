# 🔧 INSTRUCCIONES: Aplicar Migración de Carrito Multi-dispositivo

## ⚠️ PROBLEMA DETECTADO:
Prisma no puede conectarse a Supabase (posiblemente por timeout del pooler).
Solución: Aplicar el SQL manualmente en Supabase Studio.

---

## 📋 PASOS PARA APLICAR LA MIGRACIÓN:

### **1. Abrir Supabase SQL Editor**
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto de EDESA VENTAS
3. En el menú lateral, click en **"SQL Editor"**
4. Click en **"New query"**

---

### **2. Copiar y Ejecutar el SQL**

Copia TODO el contenido del archivo:
```
prisma/migrations/manual_add_userId_to_cart.sql
```

Y pégalo en el SQL Editor de Supabase.

O copia esto directamente:

```sql
-- Agregar columna userId a Cart
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Crear índice
CREATE INDEX IF NOT EXISTS "Cart_userId_idx" ON "Cart"("userId");

-- Agregar foreign key
ALTER TABLE "Cart"
  ADD CONSTRAINT "Cart_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

---

### **3. Ejecutar**
Click en el botón **"Run"** (o `Ctrl/Cmd + Enter`)

---

### **4. Verificar**
Ejecuta esta query para confirmar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Cart' AND column_name = 'userId';
```

**Resultado esperado:**
```
column_name | data_type | is_nullable
userId      | text      | YES
```

---

## ✅ DESPUÉS DE APLICAR:

### **Probar que funciona:**

1. **Abrir la app:** `npm run dev`
2. **Iniciar sesión** como cliente ferretero
3. **Agregar productos** al carrito
4. **Abrir DevTools Console** (F12)
   - Deberías ver: `💾 Carrito persistido en BD (multi-dispositivo)`
   - Y también: `📊 Carrito trackeado para abandonment analytics`

5. **Cerrar navegador completamente**
6. **Abrir en modo incógnito** (o desde tu celular)
7. **Iniciar sesión** con el mismo usuario
8. **¡MAGIA!** ✨ Deberías ver tu carrito completo

---

## 🐛 SI HAY ERRORES:

### Error: "column userId already exists"
✅ **Ignorar** - La columna ya existe, está bien.

### Error: "constraint already exists"
✅ **Ignorar** - El constraint ya existe, está bien.

### Error: "relation User does not exist"
❌ **Problema:** Verifica que la tabla User exista en tu base de datos.
Ejecuta: `SELECT * FROM "User" LIMIT 1;`

---

## 📞 CUANDO ESTÉ LISTO:
Dime "LISTO" y continuamos con la FASE 2 (Listas de Deseos).
