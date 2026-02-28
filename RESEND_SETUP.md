# 📧 CONFIGURAR RESEND PARA EMAILS TRANSACCIONALES

## PASO 1: Crear cuenta en Resend

1. Ve a: https://resend.com/signup
2. Regístrate con tu email
3. Verifica tu email

## PASO 2: Obtener API Key

1. Ve a: https://resend.com/api-keys
2. Click en "Create API Key"
3. Nombre: "EDESA VENTAS Production"
4. Permission: "Sending access"
5. Domain: "All domains" (o específico si tienes dominio verificado)
6. Click "Add"
7. **COPIA EL API KEY** (solo se muestra una vez!)

Ejemplo: `re_123abc456def789ghi012jkl345mno`

## PASO 3: Agregar al .env local

```bash
RESEND_API_KEY="re_TU_API_KEY_AQUI"
EMAIL_FROM="EDESA VENTAS <pedidos@edesaventas.ec>"
```

## PASO 4: Agregar a Vercel

```bash
cd "/Users/pablocisneros/Desktop/PROYECTOS TRABAJO PROGRAMACION /EDESA VENTAS/edesa-ventas"

vercel env add RESEND_API_KEY production \
  --value 're_TU_API_KEY_AQUI' --yes

vercel env add EMAIL_FROM production \
  --value 'EDESA VENTAS <pedidos@edesaventas.ec>' --yes

# Redeploy para activar
vercel --prod --yes
```

## PASO 5: Verificar dominio (Opcional pero recomendado)

Para evitar que los emails caigan en spam:

1. Ve a: https://resend.com/domains
2. Click "Add Domain"
3. Ingresa: `edesaventas.ec` (tu dominio)
4. Sigue las instrucciones para agregar registros DNS:
   - TXT para verificación
   - MX, TXT (SPF), TXT (DKIM) para autenticación
5. Espera verificación (5-30 minutos)

**Una vez verificado, cambia EMAIL_FROM a usar tu dominio:**
```bash
EMAIL_FROM="EDESA VENTAS <pedidos@edesaventas.ec>"
```

## LÍMITES GRATUITOS DE RESEND

- **3,000 emails/mes** GRATIS
- 100 emails/día
- Perfecto para empezar

Si necesitas más:
- Plan Pro: $20/mes → 50,000 emails
- Plan Business: $80/mes → 100,000 emails

## EMAILS QUE SE ENVÍAN AUTOMÁTICAMENTE

1. ✅ **Bienvenida** - Al registrarse nuevo usuario
2. ✅ **Confirmación de Pedido** - Al crear pedido
3. ✅ **Cambio de Estado** - Al actualizar estado del pedido
4. ⏳ **Recuperación de Contraseña** - Al solicitar reset
5. ⏳ **Alerta de Stock Bajo** - Cuando producto < stock mínimo (admin)

## TESTEAR EN DESARROLLO

En desarrollo (sin RESEND_API_KEY), los emails se loguean en consola en lugar de enviarse.

Para testear emails reales en desarrollo:
```bash
# Agregar RESEND_API_KEY a .env
RESEND_API_KEY="re_tu_api_key"

# Reiniciar servidor
npm run dev
```

## TROUBLESHOOTING

**Email no llega:**
- Verifica spam/promotions
- Verifica que RESEND_API_KEY esté correcta
- Revisa logs en: https://resend.com/emails
- Verifica dominio esté verificado (si aplica)

**Email cae en spam:**
- Verifica dominio en Resend
- Agrega registros SPF, DKIM, DMARC
- No uses "noreply@" (Resend lo bloquea)
- Usa "pedidos@", "info@", "soporte@"

## DOCUMENTACIÓN

- Docs oficiales: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- React Email: https://react.email
