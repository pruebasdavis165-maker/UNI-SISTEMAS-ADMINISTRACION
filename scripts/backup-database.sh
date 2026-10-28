#!/bin/sh
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nicalogistics_db_${TIMESTAMP}.sql.gz"
ENC_BACKUP_FILE="${BACKUP_FILE}.enc"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-NicaLogisticsBackupMasterKey2026!}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Iniciando respaldo de la base de datos nicalogistics_db..."

export PGPASSWORD="${POSTGRES_PASSWORD:-NicaLogisticsSecure2026!}"
pg_dump -h "${DB_HOST:-db-server}" -p 5432 -U "${POSTGRES_USER:-nicalogistics_user}" -d "${POSTGRES_DB:-nicalogistics_db}" --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[$(date)] Dump completado: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "${BACKUP_FILE}" -out "${ENC_BACKUP_FILE}" -k "${ENCRYPTION_KEY}"
rm -f "${BACKUP_FILE}"

echo "[$(date)] Respaldo cifrado exitosamente: ${ENC_BACKUP_FILE}"

find "${BACKUP_DIR}" -name "nicalogistics_db_*.enc" -mtime +7 -exec rm -f {} + 2>/dev/null || true

echo "[$(date)] Proceso de respaldo finalizado con éxito."