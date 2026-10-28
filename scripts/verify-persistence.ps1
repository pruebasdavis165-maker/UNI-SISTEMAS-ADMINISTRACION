# Script de Verificación de Persistencia y Volúmenes Seguros (Política 3)
Write-Host "=== Verificando volúmenes Docker de NicaLogistics ===" -ForegroundColor Cyan

docker volume ls --filter name=nicalogistics

Write-Host "Verificando inspección de volumen nicalogistics_db_data..." -ForegroundColor Yellow
docker volume inspect nicalogistics_db_data

Write-Host "Verificando inspección de volumen nicalogistics_uploads..." -ForegroundColor Yellow
docker volume inspect nicalogistics_uploads

Write-Host "=== Verificación completada con éxito ===" -ForegroundColor Green
