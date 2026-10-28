#!/usr/bin/env bash
# ==============================================================================
# NicaLogistics - Script Automatizado de Despliegue en Producción (Issue 6.6)
# ==============================================================================
set -e

echo "=========================================================="
echo " NicaLogistics - Despliegue de Producción Multi-Contenedor"
echo "=========================================================="

COMPOSE_FILE="$(dirname "$0")/../docker-compose.yml"

echo "Iniciando orquestación con Docker Compose..."
docker compose -f "${COMPOSE_FILE}" up -d --build

echo ""
echo "[OK] Servicios desplegados exitosamente:"
echo "  - NGINX Proxy SSL: https://localhost (Redirección HTTP -> HTTPS)"
echo "  - Frontend Web: http://localhost:3000"
echo "  - Backend .NET API & Swagger: https://localhost/swagger"
echo "  - PostgreSQL 16: Red interna aislada (Sin exposición a host)"
echo "  - Copias de Seguridad: Cron diario activo con cifrado AES-256"
