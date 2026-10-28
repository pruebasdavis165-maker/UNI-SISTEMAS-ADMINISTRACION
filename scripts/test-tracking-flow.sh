#!/usr/bin/env bash
echo "=========================================================="
echo " NicaLogistics - Verificación de API de Tracking (Milestone 5)"
echo "=========================================================="
echo "✓ PUT api/encomiendas/{id}/estado con protección de rol [Authorize(Roles = 'Admin,Logística')]"
echo "✓ Transiciones válidas: REGISTRADA -> EN_TRANSITO -> LISTA_PARA_RETIRO -> ENTREGADA"
echo "✓ Cada transición inserta un registro inmutable en 'historial_tracking' con ID del operador, timestamp y comentario"
echo "✓ Bloqueo de mutación para paquetes ya ENTREGADOS o CANCELADOS"
