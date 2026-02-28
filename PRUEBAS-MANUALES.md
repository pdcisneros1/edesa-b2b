# 🧪 Guía de Pruebas Manuales - EDESA VENTAS B2B

## Servidor de Desarrollo

El servidor está corriendo en: **http://localhost:3001**

---

## 1️⃣ PASSWORD RECOVERY (Recuperación de Contraseña)

### Objetivo
Verificar que los usuarios puedan recuperar su contraseña olvidada mediante email.

### Pasos para probar

#### A) Solicitar recuperación de contraseña

1. **Abrir página de forgot password**
   ```
   http://localhost:3001/forgot-password
   ```

2. **Ingresar tu email**
   - Email: `pdcisneros@gmail.com`
   - Hacer clic en "Enviar enlace de recuperación"

3. **Verificar mensaje de confirmación**
   - Debe aparecer: "Email enviado" con mensaje verde
   - Debe mostrar: "Si el email existe en nuestro sistema..."

#### B) Verificar email recibido

4. **Revisar bandeja de entrada** en `pdcisneros@gmail.com`
   - Asunto: "Recuperación de Contraseña - EDESA VENTAS"
   - **Verificar diseño nuevo:**
     - ✅ Header oscuro (#1a1a1a) con borde rojo
     - ✅ Logo "E" en cuadrado rojo
     - ✅ Nombre "EDESA VENTAS" en el header
     - ✅ Título "Recuperación de Contraseña"
     - ✅ Botón rojo "Restablecer Contraseña"
     - ✅ Footer con info de contacto y RUC

5. **Hacer clic en el botón** del email
   - Debe abrir: `http://localhost:3001/reset-password?token=xxx`

#### C) Restablecer contraseña

6. **En la página de reset-password:**
   - Ingresar nueva contraseña: `Test123456!`
   - Confirmar contraseña: `Test123456!`
   - Hacer clic en "Restablecer Contraseña"

7. **Verificar mensaje de éxito**
   - Debe aparecer: "Contraseña actualizada exitosamente"
   - Debe redirigir a `/login` automáticamente

8. **Probar login con nueva contraseña**
   - Email: `pdcisneros@gmail.com`
   - Password: `Test123456!`
   - Debe iniciar sesión correctamente

### ✅ Criterios de Éxito

- [ ] Email de recuperación recibido
- [ ] Email tiene nuevo diseño con branding EDESA
- [ ] Link en email funciona
- [ ] Página de reset muestra formulario correcto
- [ ] Contraseña se actualiza correctamente
- [ ] Login funciona con nueva contraseña

---

## 2️⃣ STOCK ALERTS (Alertas de Stock Bajo)

### Objetivo
Verificar que el sistema envíe alertas automáticas cuando productos tienen stock bajo.

### Pasos para probar

#### A) Preparar productos con stock bajo

1. **Iniciar sesión como admin**
   ```
   http://localhost:3001/login
   Email: admin@edesaventas.ec
   Password: (tu contraseña de admin)
   ```

2. **Ir al panel de productos**
   ```
   http://localhost:3001/admin/productos
   ```

3. **Editar un producto**
   - Hacer clic en "Editar" de cualquier producto
   - Cambiar stock a: `5` (menos de 10)
   - Guardar cambios

4. **Repetir con 2-3 productos más**
   - Cambiar stock a valores bajos: 3, 7, 2

#### B) Probar endpoint manual de stock alerts

5. **Abrir nueva pestaña y llamar al endpoint**
   ```
   http://localhost:3001/api/admin/stock-alerts
   ```

   - Debe mostrar error 401/403 si no estás autenticado
   - Para probarlo con autenticación, usar Postman o similar

#### C) Probar endpoint de cron

6. **Llamar al endpoint de cron**
   ```
   http://localhost:3001/api/cron/stock-alerts
   ```

7. **Verificar respuesta JSON**
   ```json
   {
     "success": true,
     "message": "Alerta enviada: 3 productos",
     "productsCount": 3,
     "timestamp": "2026-02-28T..."
   }
   ```

#### D) Verificar email recibido

8. **Revisar bandeja de entrada** en `pdcisneros@gmail.com`
   - Asunto: "⚠️ Alerta de Stock Bajo - EDESA VENTAS"
   - **Verificar diseño nuevo:**
     - ✅ Header oscuro con logo "E"
     - ✅ Título "⚠️ Alerta de Stock Bajo"
     - ✅ Subtítulo con cantidad de productos
     - ✅ Tabla con: Producto, SKU, Stock actual, Stock mínimo
     - ✅ Productos con stock 0 en rojo
     - ✅ Productos con stock <5 en naranja
     - ✅ Botón "Ver Inventario Completo"
     - ✅ Footer sin info de contacto (email interno)

### ✅ Criterios de Éxito

- [ ] Productos con stock bajo detectados
- [ ] Endpoint cron responde correctamente
- [ ] Email de alerta recibido
- [ ] Email tiene diseño nuevo con tabla de productos
- [ ] Colores visuales según nivel de stock
- [ ] Link al admin funciona

---

## 3️⃣ PDF INVOICES (Facturas en PDF)

### Objetivo
Verificar que los pedidos generen facturas PDF profesionales adjuntas al email.

### Pasos para probar

#### A) Crear un pedido nuevo

1. **Iniciar sesión como usuario**
   ```
   http://localhost:3001/login
   Email: pdcisneros@gmail.com
   Password: (tu contraseña)
   ```

2. **Ir al catálogo de productos**
   ```
   http://localhost:3001/productos
   ```

3. **Agregar productos al carrito**
   - Agregar 2-3 productos diferentes
   - Con cantidades variadas (ej: 2, 5, 1)

4. **Ir al carrito**
   ```
   http://localhost:3001/carrito
   ```
   - Verificar que los productos estén listados
   - Hacer clic en "Proceder al Checkout"

#### B) Completar checkout

5. **Paso 1: Información del cliente**
   - Llenar todos los campos requeridos
   - Continuar

6. **Paso 2: Dirección de envío**
   - Llenar dirección completa
   - Seleccionar método de envío
   - Continuar

7. **Paso 3: Confirmación**
   - Seleccionar método de pago: "Transferencia Bancaria"
   - Hacer clic en "Confirmar Pedido"

8. **Verificar página de confirmación**
   - Debe mostrar número de pedido: `EDV-20260228-XXXXX`
   - Debe mostrar "Pedido creado exitosamente"

#### C) Verificar email con PDF

9. **Revisar bandeja de entrada** en `pdcisneros@gmail.com`
   - Asunto: "Confirmación de Pedido [EDV-...] - EDESA VENTAS"
   - **Verificar diseño del email:**
     - ✅ Header oscuro con logo "E"
     - ✅ Título "¡Pedido Confirmado!"
     - ✅ Número de pedido en subtítulo
     - ✅ Tabla con productos, cantidades, precios
     - ✅ Total destacado en rojo
     - ✅ Footer con contacto

10. **Verificar archivo PDF adjunto**
    - Nombre: `Factura-EDV-20260228-XXXXX.pdf`
    - Descargar y abrir el PDF

11. **Revisar contenido del PDF:**
    - ✅ Header profesional con "EDESA VENTAS" en rojo
    - ✅ "FACTURA" en la esquina superior derecha
    - ✅ Número de pedido y fecha
    - ✅ Sección "Cliente" con todos los datos
    - ✅ Sección "Dirección de Envío"
    - ✅ Tabla de productos con:
      - Producto (nombre + SKU)
      - Cantidad
      - Precio unitario
      - Subtotal
    - ✅ Totales:
      - Subtotal
      - Envío
      - IVA (15%)
      - **TOTAL en bloque rojo**
    - ✅ Sección "Información de Pago" (si es transferencia)
      - Banco
      - Número de cuenta
      - Beneficiario
      - RUC
      - Referencia
    - ✅ Footer con datos de la empresa

### ✅ Criterios de Éxito

- [ ] Pedido creado exitosamente
- [ ] Email de confirmación recibido
- [ ] Email tiene nuevo diseño con branding
- [ ] PDF adjunto al email
- [ ] PDF se descarga correctamente
- [ ] PDF tiene diseño profesional
- [ ] Todos los datos del pedido correctos
- [ ] Cálculos matemáticos correctos

---

## 4️⃣ EMAIL BRANDING (Diseño Unificado)

### Objetivo
Verificar que TODOS los emails del sistema tengan el diseño unificado con branding EDESA.

### Emails a verificar

#### A) Welcome Email (Registro)

1. **Registrar nuevo usuario**
   ```
   http://localhost:3001/register
   Email: test-branding@example.com
   Password: Test123456!
   ```

2. **Revisar email de bienvenida**
   - Asunto: "¡Bienvenido a EDESA VENTAS!"
   - **Verificar:**
     - ✅ Header oscuro con logo "E"
     - ✅ Título "¡Bienvenido a EDESA VENTAS!"
     - ✅ Subtítulo "Tu cuenta ha sido creada exitosamente"
     - ✅ Lista de beneficios B2B
     - ✅ Botón rojo "Ver Catálogo de Productos"
     - ✅ Footer con contacto y RUC

#### B) Password Reset Email

3. **Solicitar reset de contraseña**
   - Ya probado en sección 1
   - Verificar mismo diseño

#### C) Order Confirmation Email

4. **Crear pedido**
   - Ya probado en sección 3
   - Verificar mismo diseño

#### D) Order Status Email (Opcional)

5. **Cambiar estado de un pedido (como admin)**
   ```
   http://localhost:3001/admin/pedidos
   ```
   - Abrir un pedido
   - Cambiar estado de "Pendiente de Pago" a "Confirmado"
   - Agregar mensaje: "Tu pedido ha sido confirmado y está siendo procesado"
   - Guardar

6. **Revisar email de actualización**
   - Asunto: "Actualización de Pedido [EDV-...] - Confirmado"
   - **Verificar diseño unificado**

#### E) Low Stock Alert Email

7. **Ya probado en sección 2**
   - Verificar diseño unificado

### ✅ Checklist de Branding Unificado

Todos los emails deben tener:

**Header:**
- [ ] Fondo oscuro (#1a1a1a)
- [ ] Borde rojo superior de 4px (#dc2626)
- [ ] Logo "E" en cuadrado rojo
- [ ] Nombre "EDESA VENTAS" centrado
- [ ] Título y subtítulo (cuando aplique)

**Cuerpo:**
- [ ] Fondo blanco limpio
- [ ] Tipografía consistente
- [ ] Botones CTA en rojo (#dc2626)
- [ ] Espaciado consistente

**Footer:**
- [ ] Línea divisora gris
- [ ] Info de contacto (cuando aplique)
- [ ] RUC y ubicación
- [ ] Disclaimer sobre email automático
- [ ] Tipografía gris más pequeña

---

## 🎯 Resumen de Pruebas

### Resultados Esperados

| Feature | Endpoint | Email | PDF | Branding |
|---------|----------|-------|-----|----------|
| Password Recovery | ✅ | ✅ | N/A | ✅ |
| Stock Alerts | ✅ | ✅ | N/A | ✅ |
| PDF Invoices | ✅ | ✅ | ✅ | ✅ |
| Email Branding | N/A | ✅ | N/A | ✅ |

### Checklist Final

- [ ] ✅ Password Recovery funciona end-to-end
- [ ] ✅ Stock Alerts detecta productos y envía email
- [ ] ✅ PDF Invoices genera facturas profesionales
- [ ] ✅ Todos los emails tienen diseño unificado
- [ ] ✅ Logos y colores EDESA consistentes
- [ ] ✅ Footer con info legal en todos los emails
- [ ] ✅ Botones CTA funcionan correctamente
- [ ] ✅ Emails llegan a pdcisneros@gmail.com

---

## 🚨 Problemas Conocidos

### Limitación Temporal de Emails

**Estado actual:**
- Los emails solo llegan a `pdcisneros@gmail.com` (dueño de la cuenta Resend)
- Usando dominio temporal: `onboarding@resend.dev`

**Solución futura:**
- Comprar dominio `edesaventas.ec`
- Verificar dominio en Resend (seguir `RESEND_DOMAIN_VERIFICATION.md`)
- Cambiar `EMAIL_FROM` a `pedidos@edesaventas.ec`
- Enviar emails a cualquier dirección

### Configuración de CRON_SECRET

**Recomendación para producción:**
```bash
# En Vercel > Settings > Environment Variables
CRON_SECRET=<generar con: openssl rand -base64 32>
```

---

## 📝 Notas Adicionales

### Herramientas Útiles

- **Resend Dashboard:** https://resend.com/emails
  - Ver todos los emails enviados
  - Ver logs de errores
  - Ver estadísticas de entrega

- **Prisma Studio:** `npm run db:studio`
  - Ver datos de la base de datos
  - Verificar resetToken generados
  - Ver productos con stock bajo

### Tips de Desarrollo

1. **Limpiar rate limiting** (si te bloquean):
   ```bash
   # Reiniciar servidor de desarrollo
   # El rate limiting es en memoria y se resetea
   ```

2. **Ver logs del servidor:**
   ```bash
   tail -f /private/tmp/claude-501/.../tasks/bf40b86.output
   ```

3. **Test rápido de emails:**
   - Todos los emails se envían a pdcisneros@gmail.com
   - Puedes crear múltiples usuarios y todos llegarán ahí
   - Revisar carpeta de Spam si no llegan

---

**¡Buena suerte con las pruebas! 🚀**
