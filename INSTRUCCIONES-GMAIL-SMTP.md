# 📧 Configurar Gmail SMTP para EDESA VENTAS

## ⚠️ IMPORTANTE: Generar Contraseña de Aplicación

**NO puedes usar tu contraseña normal de Gmail.** Necesitas generar una **Contraseña de Aplicación**.

---

## 📝 Pasos para Obtener la Contraseña de Aplicación

### 1. Activar Verificación en 2 Pasos
**REQUISITO:** Gmail requiere que tengas la verificación en 2 pasos activa.

1. Ve a: https://myaccount.google.com/security
2. En "Cómo inicias sesión en Google", haz clic en **"Verificación en 2 pasos"**
3. Si NO está activada, actívala ahora (sigue los pasos de Google)
4. Una vez activada, continúa al siguiente paso

---

### 2. Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
   - O busca "Contraseñas de aplicaciones" en tu cuenta de Google

2. Si te pide iniciar sesión nuevamente, hazlo

3. En "Seleccionar app", elige **"Otra (nombre personalizado)"**

4. Escribe: **"EDESA VENTAS"**

5. Haz clic en **"Generar"**

6. Google te mostrará una **contraseña de 16 caracteres** como:
   ```
   abcd efgh ijkl mnop
   ```

7. **COPIA esta contraseña** (sin espacios)

---

## 🔧 Configurar en el Proyecto

### Paso 1: Actualizar `.env` (local)

Abre el archivo `.env` y reemplaza:

```bash
SMTP_PASS="TU_CONTRASEÑA_DE_APLICACION_AQUI"
```

Por:

```bash
SMTP_PASS="abcdefghijklmnop"  # Tu contraseña de 16 caracteres SIN espacios
```

### Paso 2: Verificar el Email

Confirma que el email en `.env` sea el correcto:

```bash
SMTP_USER="pdcisneros@gmail.com"
EMAIL_FROM="EDESA VENTAS <pdcisneros@gmail.com>"
```

Si quieres usar otro email de Gmail, cámbialo aquí.

---

## 🚀 Configurar en Vercel (Producción)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard

2. Click en tu proyecto → **Settings** → **Environment Variables**

3. Agrega las siguientes variables:

| Variable | Valor |
|----------|-------|
| `EMAIL_PROVIDER` | `gmail` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `pdcisneros@gmail.com` |
| `SMTP_PASS` | `tu-contraseña-de-aplicación` |
| `EMAIL_FROM` | `EDESA VENTAS <pdcisneros@gmail.com>` |

4. Click en **Save**

5. **Redeploy** el proyecto para que tome las nuevas variables

---

## ✅ Probar que Funciona

Una vez configurado:

1. Reinicia el servidor local:
   ```bash
   npm run dev
   ```

2. Ve a: http://localhost:3001/admin/pedidos

3. Cambia el estado de un pedido a "Pagado" o "Enviado"

4. Verifica que el email llegue al cliente

---

## 🔒 Seguridad

✅ **La contraseña de aplicación es segura** porque:
- Solo funciona para SMTP, no da acceso completo a tu cuenta
- Puedes revocarla en cualquier momento desde https://myaccount.google.com/apppasswords
- Si alguien la obtiene, solo puede enviar emails, no leer tu correo

❌ **NUNCA subas tu contraseña a GitHub:**
- El archivo `.env` está en `.gitignore`
- Solo agrégala en Vercel manualmente

---

## 📊 Límites de Gmail

Gmail SMTP tiene estos límites:

- **500 emails por día** (suficiente para B2B)
- Si necesitas más, considera usar **Google Workspace** (sin límite)

---

## 🆘 Solución de Problemas

### Error: "Username and Password not accepted"
→ Verifica que hayas activado la verificación en 2 pasos

### Error: "Invalid login"
→ Asegúrate de copiar la contraseña SIN espacios

### Los emails no llegan
→ Revisa la carpeta de SPAM del destinatario

### Gmail bloquea el envío
→ Ve a https://accounts.google.com/DisplayUnlockCaptcha y permite el acceso

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas generando la contraseña:
1. Confirma que la verificación en 2 pasos esté activa
2. Intenta desde Chrome (a veces otros navegadores tienen problemas)
3. Cierra sesión y vuelve a iniciar en Google

---

**Una vez configurado, los emails llegarán a TODOS los clientes, no solo a tu Gmail.**
