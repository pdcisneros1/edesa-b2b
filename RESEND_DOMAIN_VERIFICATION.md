# 🌐 VERIFICAR DOMINIO EN RESEND

## ❗ Por qué es necesario

**Problema actual:**
Los emails solo se envían a `pdcisneros@gmail.com` porque estamos usando el dominio temporal de Resend (`onboarding@resend.dev`).

**Solución:**
Verificar el dominio `edesaventas.ec` en Resend para enviar emails a **cualquier dirección** (clientes reales).

---

## 📋 PASO A PASO

### 1️⃣ Agregar Dominio en Resend

1. **Ir a:** https://resend.com/domains
2. **Iniciar sesión** con la cuenta de Resend
3. **Click en:** "Add Domain"
4. **Ingresar:** `edesaventas.ec`
5. **Click en:** "Add"

Resend te mostrará una pantalla con los registros DNS que debes configurar.

---

### 2️⃣ Obtener Registros DNS

Resend te mostrará algo como esto:

```
┌──────────────────────────────────────────────────────────────────┐
│ DNS Records for edesaventas.ec                                   │
├──────┬───────────────────┬──────────────────────────────────────┤
│ Type │ Name              │ Value                                │
├──────┼───────────────────┼──────────────────────────────────────┤
│ TXT  │ @                 │ resend-domain-verification=abc123... │
│ MX   │ @                 │ feedback-smtp.us-east-1.amazonses... │
│ TXT  │ resend._domainkey │ v=DKIM1; k=rsa; p=MIGfMA0GCS...     │
└──────┴───────────────────┴──────────────────────────────────────┘
```

**COPIA estos valores** (los necesitarás en el siguiente paso).

---

### 3️⃣ Configurar DNS en tu Proveedor

¿Dónde compraste el dominio `edesaventas.ec`?

#### Opción A: GoDaddy
1. Ir a https://dcc.godaddy.com/manage/
2. Buscar `edesaventas.ec` → Click en "DNS"
3. Scroll hasta "Records"
4. Para cada registro de Resend, click en "Add Record":
   - **Type:** TXT (o MX según corresponda)
   - **Name:** @ (o resend._domainkey)
   - **Value:** Pegar el valor de Resend
   - **TTL:** 3600 (o el predeterminado)
5. Click "Save"

#### Opción B: Namecheap
1. Ir a https://namecheap.com → Account → Domain List
2. Click en "Manage" junto a `edesaventas.ec`
3. Tab "Advanced DNS"
4. Click "Add New Record"
5. Configurar cada registro de Resend
6. Click "Save All Changes"

#### Opción C: Cloudflare
1. Ir a https://cloudflare.com → Websites
2. Seleccionar `edesaventas.ec`
3. Tab "DNS" → "Records"
4. Click "Add record"
5. Configurar cada registro de Resend
6. Click "Save"

#### Opción D: Otro Proveedor
Busca la sección "DNS Management" o "Advanced DNS" en el panel de tu proveedor y agrega los registros que Resend indicó.

---

### 4️⃣ Esperar Verificación

- ⏱️ **Tiempo:** 5-30 minutos (puede tardar hasta 24h en casos raros)
- 🔄 Resend verifica automáticamente cada pocos minutos
- ✅ Cuando esté listo, verás un **checkmark verde** en https://resend.com/domains

**Mientras esperas:**
- Puedes verificar el estado en https://resend.com/domains
- Si después de 1 hora no se verifica, revisa que los registros DNS estén exactamente como Resend los indicó

---

### 5️⃣ Actualizar EMAIL_FROM

**Una vez verificado el dominio, avísame y yo actualizaré:**

1. En Vercel (producción):
   ```bash
   EMAIL_FROM="EDESA VENTAS <pedidos@edesaventas.ec>"
   ```

2. En `.env` (local):
   ```bash
   EMAIL_FROM="EDESA VENTAS <pedidos@edesaventas.ec>"
   ```

3. Redeploy a producción

---

## 🧪 PROBAR QUE FUNCIONA

Una vez verificado el dominio y actualizado `EMAIL_FROM`:

### Test 1: Registro
```
1. Ir a https://edesa-ventas.vercel.app/register
2. Registrarse con CUALQUIER email (no solo pdcisneros@gmail.com)
3. Verificar que llegue el email de bienvenida ✅
```

### Test 2: Pedido
```
1. Agregar productos al carrito
2. Completar checkout
3. Confirmar pedido
4. Verificar que llegue el email de confirmación ✅
```

---

## 📊 BENEFICIOS DE VERIFICAR EL DOMINIO

- ✅ **Enviar a cualquier email:** Clientes, proveedores, etc.
- ✅ **Mejor deliverability:** Menos probabilidad de caer en spam
- ✅ **Marca profesional:** `pedidos@edesaventas.ec` vs `onboarding@resend.dev`
- ✅ **Más confianza:** Los clientes ven tu dominio real
- ✅ **Sin límites:** Hasta 3,000 emails/mes (plan gratuito)

---

## ❓ TROUBLESHOOTING

### ❌ "Domain verification pending" después de 1 hora

**Solución:**
1. Ve a tu proveedor DNS y verifica que los registros estén exactamente como Resend los indicó
2. Usa https://mxtoolbox.com/SuperTool.aspx para verificar que los registros DNS sean visibles públicamente
3. Ingresa `edesaventas.ec` y verifica que aparezcan los registros TXT y MX
4. Si no aparecen, espera un poco más (propagación DNS puede tardar)

### ❌ "Invalid DNS records"

**Solución:**
1. Asegúrate de copiar los valores COMPLETOS de Resend
2. No agregues comillas alrededor de los valores
3. El campo "Name" para el registro de verificación debe ser `@` (no vacío, no el dominio completo)
4. Para el registro DKIM, el campo "Name" debe ser `resend._domainkey` (no `resend._domainkey.edesaventas.ec`)

### ❌ "Emails still going to spam"

**Solución:**
1. Verifica que TODOS los registros DNS estén configurados (TXT, MX, DKIM)
2. Espera 24-48 horas para que los proveedores de email reconozcan el dominio verificado
3. Pide a los destinatarios que marquen el email como "No es spam"

---

## 📞 SOPORTE

- **Resend Docs:** https://resend.com/docs/dashboard/domains/introduction
- **Resend Support:** support@resend.com
- **Verificar DNS:** https://mxtoolbox.com/

---

## ✅ CHECKLIST

- [ ] Agregar dominio `edesaventas.ec` en Resend
- [ ] Copiar registros DNS de Resend
- [ ] Configurar registros DNS en proveedor
- [ ] Esperar verificación (checkmark verde en Resend)
- [ ] Avisar a Claude para actualizar `EMAIL_FROM`
- [ ] Probar envío de emails a cualquier dirección
- [ ] Confirmar que no caen en spam
