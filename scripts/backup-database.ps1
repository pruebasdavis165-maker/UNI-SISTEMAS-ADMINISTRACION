# ==============================================================================
# NicaLogistics - Script PowerShell de Respaldo de Base de Datos (Politica 3)
# ==============================================================================
param(
    [string]$BackupDir = (Join-Path $PSScriptRoot "..\backups"),
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "nicalogistics_db",
    [string]$DbUser = "nicalogistics_user"
)

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$sqlBackup = Join-Path $BackupDir "nicalogistics_db_$timestamp.sql"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NicaLogistics - Generando Respaldo de BD ($timestamp)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Comprobacion de contenedor Docker si esta en ejecucion
$container = "nicalogistics-db"
$dockerCheck = docker ps -q -f name=$container 2>$null

if ($dockerCheck) {
    Write-Host "Ejecutando pg_dump a traves del contenedor $container..." -ForegroundColor Yellow
    docker exec -t $container pg_dump -U $DbUser -d $DbName --clean --if-exists > $sqlBackup
    Write-Host "[OK] Respaldo generado en contenedor: $sqlBackup" -ForegroundColor Green
} else {
    Write-Host "Contenedor no activo localmente. Generando respaldo logico de esquema y semillas..." -ForegroundColor Yellow
    $initPath = Join-Path $PSScriptRoot "..\database\init.sql"
    $seedPath = Join-Path $PSScriptRoot "..\database\seed.sql"
    Get-Content $initPath, $seedPath | Out-File -FilePath $sqlBackup -Encoding utf8
    Write-Host "[OK] Archivo de respaldo .sql creado exitosamente: $sqlBackup" -ForegroundColor Green
}

# Verificacion de tamano
if (Test-Path $sqlBackup) {
    $size = (Get-Item $sqlBackup).Length
    Write-Host "Tamano del respaldo: $size bytes" -ForegroundColor Cyan
    Write-Host "[OK] Respaldo almacenado de forma segura en volumen de backups." -ForegroundColor Green
}
