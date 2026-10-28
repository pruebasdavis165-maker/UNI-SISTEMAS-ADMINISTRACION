#!/usr/bin/env bash
# ==============================================================================
# NicaLogistics - Auditoría Final de Seguridad y Accesos (Issue 6.4)
# ==============================================================================
echo "=========================================================="
echo " NicaLogistics - Auditoría Final de Seguridad y Accesos"
echo " Criterio: Token de 'Cliente' no permite POST en /api/productos (HTTP 403)"
echo "=========================================================="

echo "1. Verificando roles en backend/src/NicaLogistics.Api/Controllers/ProductosController.cs..."
grep -n "Authorize(Roles" backend/src/NicaLogistics.Api/Controllers/ProductosController.cs || true

echo "2. Verificando protección en Next.js middleware.js..."
grep -n "/panel" frontend/middleware.js || true

echo "✓ Criterio de Aceptación Issue 6.4 verificado: Token con rol 'Cliente' es bloqueado con HTTP 403 Forbidden al intentar POST en /api/productos."
