# ==============================================================================
# NicaLogistics - Script Automatizado de Despliegue en Produccion (Issue 6.6)
# ==============================================================================
param(
    [switch]$Build = $true,
    [switch]$Detached = $true
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NicaLogistics - Despliegue de Produccion Multi-Contenedor" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$composeFile = Join-Path $PSScriptRoot "..\docker-compose.yml"

Write-Host "Iniciando orquestacion con Docker Compose..." -ForegroundColor Yellow
$cmdArgs = @("compose", "-f", $composeFile, "up")
if ($Build) { $cmdArgs += "--build" }
if ($Detached) { $cmdArgs += "-d" }

& docker @cmdArgs

Write-Host "`n[OK] Servicios desplegados exitosamente:" -ForegroundColor Green
Write-Host "  - NGINX Proxy SSL: https://localhost (Redireccion HTTP -> HTTPS)" -ForegroundColor White
Write-Host "  - Frontend Web: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend .NET API & Swagger: https://localhost/swagger" -ForegroundColor White
Write-Host "  - PostgreSQL 16: Red interna aislada (Sin exposicion a host)" -ForegroundColor White
Write-Host "  - Copias de Seguridad: Cron diario activo con cifrado AES-256" -ForegroundColor White
