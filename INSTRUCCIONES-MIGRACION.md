# 🚀 APLICAR MIGRACIÓN A LA BASE DE DATOS

## ⏱️ Tiempo estimado: 2 minutos

---

## **PASO 1: Abre Supabase Dashboard**

1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión si no lo has hecho
3. Selecciona tu proyecto: **EDESA VENTAS** (el que tiene tu base de datos)

---

## **PASO 2: Ve al SQL Editor**

1. En el **menú lateral izquierdo**, busca el ícono de código `</>`
2. Haz clic en **"SQL Editor"**
3. Verás una pantalla con un editor de SQL

---

## **PASO 3: Abre el archivo SQL de migración**

1. En tu computadora, ve a la carpeta del proyecto:
   ```
   /Users/pablocisneros/Desktop/PROYECTOS TRABAJO PROGRAMACION /EDESA VENTAS/edesa-ventas/
   ```

2. Abre el archivo: **`migration-conversion-tracking.sql`**
   - Puedes abrirlo con cualquier editor de texto
   - O desde VS Code: haz clic en el archivo

3. **Selecciona TODO el contenido** (Cmd+A / Ctrl+A)

4. **Copia todo** (Cmd+C / Ctrl+C)

---

## **PASO 4: Ejecuta el SQL en Supabase**

1. Vuelve a Supabase Dashboard → SQL Editor

2. Haz clic en **"New query"** (botón arriba a la derecha)

3. **Pega** el SQL que copiaste (Cmd+V / Ctrl+V)

4. Haz clic en el botón **"Run"** (o presiona Cmd+Enter / Ctrl+Enter)

---

## **PASO 5: Verifica que funcionó**

Después de ejecutar, deberías ver en la parte inferior:

✅ **Success. No rows returned**

Y luego más abajo, dos tablas mostrando:

**Tabla 1 - Columnas nuevas en User:**
```
column_name   | data_type | is_nullable
--------------|-----------|-------------
lastLoginAt   | timestamp | YES
sessionCount  | integer   | NO
```

**Tabla 2 - Estructura de AbandonedCart:**
```
column_name        | data_type | is_nullable
-------------------|-----------|-------------
id                 | text      | NO
userId             | text      | YES
items              | jsonb     | NO
subtotal           | double    | NO
total              | double    | NO
status             | USER-DEF  | NO
...                | ...       | ...
```

---

## **✅ LISTO!**

Si ves esas tablas, la migración fue **exitosa**.

Ahora vuelve aquí y dime: **"Migración aplicada"**

Y continuaré con el siguiente paso automáticamente.

---

## **❌ SI ALGO SALIÓ MAL**

Si ves un error rojo, copia el mensaje de error completo y pégalo aquí para ayudarte.

---

## **🔍 Opcional: Ver las tablas creadas**

1. En Supabase Dashboard, ve a **"Table Editor"** (menú lateral)
2. Busca la tabla **"AbandonedCart"** en la lista
3. Haz clic en ella para ver su estructura
4. También verifica la tabla **"User"** y verás las nuevas columnas `lastLoginAt` y `sessionCount`
