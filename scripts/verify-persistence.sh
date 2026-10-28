#!/bin/bash
set -e
echo "=== Verificando volúmenes Docker de NicaLogistics ==="
docker volume ls --filter name=nicalogistics
docker volume inspect nicalogistics_db_data || true
docker volume inspect nicalogistics_uploads || true
echo "=== Verificación completada ==="
