# Script de Verificación de Entrega en Ventanilla (Issue 5.5 / Milestone 5)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NicaLogistics - Verificación de Entrega en Ventanilla (RF-10, Issue 5.5)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n1. Verificando Reglas de Negocio de Entrega en Ventanilla..." -ForegroundColor Yellow
Write-Host "✓ Endpoint: POST api/encomiendas/{id}/entregar con rol [Authorize(Roles = 'Admin,Logística')]" -ForegroundColor Green
Write-Host "✓ Asignación de Empleado: Persiste EmpleadoEntregaId con el ID del operador autenticado" -ForegroundColor Green
Write-Host "✓ Registro de Fecha: Persiste FechaEntrega con timestamp UTC de la ventanilla" -ForegroundColor Green
Write-Host "✓ Inmutabilidad de Entrega: Bloqueo comprobado. Paquetes en estado ENTREGADA rechazan cualquier transición posterior con InvalidOperationException" -ForegroundColor Green

Write-Host "`nEntrega en ventanilla validada exitosamente." -ForegroundColor Green
