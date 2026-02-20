#!/bin/bash

# EDESA VENTAS - Pre-Deploy Verification Script
# Este script verifica que el proyecto esté listo para desplegar a producción
# Uso: ./pre-deploy-check.sh

set -e

echo "=========================================="
echo "EDESA VENTAS - Pre-Deploy Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    success "Node.js version: $(node -v)"
else
    error "Node.js version must be 18 or higher. Current: $(node -v)"
fi
echo ""

echo "2. Checking npm dependencies..."
if npm list --depth=0 > /dev/null 2>&1; then
    success "All dependencies installed"
else
    warning "Some dependencies may be missing. Run: npm install"
fi
echo ""

echo "3. Checking environment variables..."
if [ -f .env ]; then
    success ".env file exists"

    # Check critical variables
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "ADMIN_EMAIL" "ADMIN_PASSWORD" "NEXT_PUBLIC_APP_URL" "NEXT_PUBLIC_SITE_NAME")

    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env; then
            VALUE=$(grep "^${VAR}=" .env | cut -d'=' -f2-)
            if [[ "$VALUE" == *"REEMPLAZAR"* ]] || [[ "$VALUE" == *"REPLACE"* ]] || [ -z "$VALUE" ]; then
                error "$VAR is not configured (contains placeholder or is empty)"
            else
                success "$VAR is configured"
            fi
        else
            error "$VAR is missing from .env"
        fi
    done
else
    error ".env file not found. Copy .env.example to .env"
fi
echo ""

echo "4. Checking .gitignore..."
if grep -q "^\.env" .gitignore; then
    success ".env is in .gitignore"
else
    error ".env is NOT in .gitignore (security risk!)"
fi
echo ""

echo "5. Running TypeScript check..."
if npm run build > /dev/null 2>&1; then
    success "TypeScript compilation successful"
else
    error "TypeScript compilation failed. Run: npm run build"
fi
echo ""

echo "6. Running linter..."
if npm run lint > /dev/null 2>&1; then
    success "ESLint passed with no errors"
else
    warning "ESLint found issues. Run: npm run lint"
fi
echo ""

echo "7. Checking Prisma schema..."
if [ -f prisma/schema.prisma ]; then
    success "Prisma schema exists"

    # Check if Prisma client is generated
    if [ -d node_modules/.prisma/client ]; then
        success "Prisma client is generated"
    else
        warning "Prisma client not generated. Run: npm run db:generate"
    fi
else
    error "Prisma schema not found"
fi
echo ""

echo "8. Checking critical files..."
CRITICAL_FILES=(
    "next.config.ts"
    "src/middleware.ts"
    "src/lib/prisma.ts"
    "src/lib/auth.ts"
    "README.md"
    "DEPLOYMENT.md"
    "VERCEL-DEPLOY.md"
    "PRODUCTION-CHECKLIST.md"
)

for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        success "$FILE exists"
    else
        error "$FILE is missing"
    fi
done
echo ""

echo "9. Checking for sensitive data in Git..."
if git check-ignore .env > /dev/null 2>&1; then
    success ".env is properly ignored by Git"
else
    warning ".env may be tracked by Git. Verify with: git status"
fi
echo ""

echo "10. Checking DATABASE_URL format..."
if [ -f .env ]; then
    DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
    if [[ "$DB_URL" == *"pgbouncer=true"* ]]; then
        success "DATABASE_URL includes pgbouncer=true"
    elif [[ "$DB_URL" == postgresql* ]]; then
        warning "DATABASE_URL should include ?pgbouncer=true for Supabase"
    fi
fi
echo ""

echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Read VERCEL-DEPLOY.md for deployment instructions"
    echo "  2. Configure environment variables in Vercel"
    echo "  3. Deploy to production"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Review and fix if necessary.${NC}"
    echo ""
    echo "You can proceed with deployment, but review warnings above."
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found. Fix before deploying.${NC}"
    echo ""
    echo "Fix the errors above before deploying to production."
    exit 1
fi
