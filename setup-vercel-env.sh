#!/bin/bash

# Script para configurar variables de entorno en Vercel Production
# Este script lee el .env local y sube las variables a Vercel

set -e

echo "🔧 Configurando variables de entorno en Vercel Production..."
echo ""

# Función para agregar variable a Vercel
add_env_var() {
  local name=$1
  local value=$2
  local scope="production"

  echo "📤 Agregando: $name"

  # Usar printf para manejar valores con caracteres especiales
  printf "%s\n%s\n%s\n" "$value" "$scope" "n" | vercel env add "$name" production 2>/dev/null || {
    echo "⚠️  $name ya existe o hubo un error, intentando actualizar..."
    vercel env rm "$name" production --yes 2>/dev/null || true
    printf "%s\n%s\n%s\n" "$value" "$scope" "n" | vercel env add "$name" production 2>/dev/null || true
  }
}

# Leer variables del archivo .env
if [ ! -f .env ]; then
  echo "❌ Archivo .env no encontrado"
  exit 1
fi

# Extraer variables del .env (solo las que no son comentarios)
while IFS='=' read -r key value; do
  # Ignorar comentarios y líneas vacías
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue

  # Limpiar comillas del valor
  value=$(echo "$value" | sed 's/^"//;s/"$//')

  # Solo procesar variables específicas
  case $key in
    DATABASE_URL|JWT_SECRET|ADMIN_EMAIL|ADMIN_PASSWORD|UPSTASH_REDIS_REST_URL|UPSTASH_REDIS_REST_TOKEN|NEXT_PUBLIC_*)
      add_env_var "$key" "$value"
      ;;
  esac
done < .env

echo ""
echo "✅ Variables de entorno configuradas en Vercel Production"
