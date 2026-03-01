#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBA PARA CRON JOBS
# ============================================================================
# Uso:
#   chmod +x test-cron-jobs.sh
#   ./test-cron-jobs.sh
# ============================================================================

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Token secreto
CRON_SECRET="R8oFIi4gbU4AkN+Hq9eDglegTv6DQAGjA1J/6erWU4A="

# URL base (cambiar si estás probando en producción)
BASE_URL="http://localhost:3001"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PRUEBA DE CRON JOBS - EDESA VENTAS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# TEST 1: Identificar Carritos Abandonados
# ============================================================================
echo -e "${YELLOW}📋 TEST 1: Identificar Carritos Abandonados${NC}"
echo -e "Endpoint: ${BASE_URL}/api/cron/identify-abandoned-carts"
echo ""

RESPONSE_1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "${BASE_URL}/api/cron/identify-abandoned-carts" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json")

HTTP_STATUS_1=$(echo "$RESPONSE_1" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY_1=$(echo "$RESPONSE_1" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS_1" = "200" ]; then
  echo -e "${GREEN}✅ Status: $HTTP_STATUS_1 OK${NC}"
  echo -e "${GREEN}Respuesta:${NC}"
  echo "$BODY_1" | python3 -m json.tool 2>/dev/null || echo "$BODY_1"
else
  echo -e "${RED}❌ Status: $HTTP_STATUS_1 ERROR${NC}"
  echo -e "${RED}Respuesta:${NC}"
  echo "$BODY_1"
fi

echo ""
echo -e "${BLUE}────────────────────────────────────────────────────────${NC}"
echo ""

# ============================================================================
# TEST 2: Enviar Emails de Recuperación
# ============================================================================
echo -e "${YELLOW}📧 TEST 2: Enviar Emails de Recuperación${NC}"
echo -e "Endpoint: ${BASE_URL}/api/cron/send-recovery-emails"
echo ""

RESPONSE_2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "${BASE_URL}/api/cron/send-recovery-emails" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json")

HTTP_STATUS_2=$(echo "$RESPONSE_2" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY_2=$(echo "$RESPONSE_2" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS_2" = "200" ]; then
  echo -e "${GREEN}✅ Status: $HTTP_STATUS_2 OK${NC}"
  echo -e "${GREEN}Respuesta:${NC}"
  echo "$BODY_2" | python3 -m json.tool 2>/dev/null || echo "$BODY_2"
else
  echo -e "${RED}❌ Status: $HTTP_STATUS_2 ERROR${NC}"
  echo -e "${RED}Respuesta:${NC}"
  echo "$BODY_2"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# RESUMEN
# ============================================================================
echo -e "${YELLOW}📊 RESUMEN DE PRUEBAS${NC}"
echo ""

if [ "$HTTP_STATUS_1" = "200" ] && [ "$HTTP_STATUS_2" = "200" ]; then
  echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
  echo -e "${GREEN}Los cron jobs están funcionando correctamente${NC}"
  exit 0
else
  echo -e "${RED}❌ ALGUNOS TESTS FALLARON${NC}"
  echo -e "${RED}Revisa los errores arriba${NC}"
  exit 1
fi
