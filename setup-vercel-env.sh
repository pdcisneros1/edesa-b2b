#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Uso: bash setup-vercel-env.sh

echo "🚀 Configurando variables de entorno en Vercel..."

vercel env add EMAIL_PROVIDER production <<< "gmail"
vercel env add SMTP_HOST production <<< "smtp.gmail.com"
vercel env add SMTP_PORT production <<< "587"
vercel env add SMTP_USER production <<< "pdcisneros@gmail.com"
vercel env add SMTP_PASS production <<< "awkiafkoyhannfce"
vercel env add EMAIL_FROM production <<< "EDESA VENTAS <pdcisneros@gmail.com>"

echo "✅ Variables configuradas!"
echo "🔄 Ahora ejecuta: vercel --prod"
echo "   Para redesplegar con las nuevas variables"
