# Manual de Operaciones, Soporte Técnico y Despliegue en Producción
## Plataforma Enterprise "NicaLogistics"

> **Versión del Sistema:** 2.0 Enterprise  
> **Arquitectura:** Hexagonal Clean Architecture (.NET 9 C#) + Next.js 14 App Router (React)  
> **Infraestructura:** Docker Compose Multi-Contenedor + NGINX Proxy Reverso SSL + PostgreSQL 16  
> **Cumplimiento TI:** Políticas de Seguridad 1 a 8, RNF-01, RNF-02, RF-01 a RF-14  

---

## 1. Resumen Ejecutivo y Regla de Negocio Crítica

**NicaLogistics** es una solución corporativa integral diseñada para el comercio electrónico y la gestión de envíos internacionales y locales. 

### Regla de Negocio Fundamental: "Sede a Sede" (Pickup en Ventanilla)
* **El sistema NO realiza entregas a domicilio particulares.**
* Todos los pedidos de compra (Checkout) y traslados de encomiendas operan de forma estricta entre sedes oficiales autorizadas:
  1. **Sede Central Managua (Nicaragua)** - Ventanilla oficial de despacho y retiro nacional.
  2. **Sede Miami Hub (Estados Unidos)** - Ventanilla oficial de despacho y retiro internacional (Flujo comercial bidireccional Managua ⇄ Miami).



* **Prohibición de campos de dirección física:** Ningún formulario del sistema solicita calle, número, apartamento o código postal domiciliario. Toda entrega se realiza presentando identificación oficial física (Cédula o Pasaporte) en la ventanilla de la sede de destino seleccionada.

---

## 2. Topología de Infraestructura (Docker Compose)

El sistema se orquesta mediante `docker-compose.yml` dividiendo las responsabilidades en redes aisladas para máxima seguridad:

```
                          Internet (HTTPS: 443 / HTTP: 80)
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │    reverse-proxy (NGINX)       │
                      │  Redirección 301 a HTTPS (443) │
                      │  Certificados TLS 1.2 / 1.3    │
                      └──────────────┬─────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │ Red: web-net                          │
                 ▼                                       ▼
      ┌──────────────────────┐               ┌──────────────────────┐
      │   frontend-web       │               │    backend-api       │
      │   (Next.js 14)       │               │    (C# .NET 9)       │
      │   Puerto int: 3000   │               │    Puerto int: 5000  │
      └──────────────────────┘               └───────────┬──────────┘
                                                         │
                                                         │ Red: internal-net (Aislada)
                                                         ▼
                                             ┌──────────────────────┐
                                             │    db-server         │
                                             │  (PostgreSQL 16)     │
                                             │  Sin puertos host    │
                                             └───────────┬──────────┘
                                                         │
                                                         ▼
                                             ┌──────────────────────┐
                                             │    db-backup         │
                                             │  Cron diario cifrado │
                                             │  AES-256 + GZIP      │
                                             └──────────────────────┘
```

### Volúmenes Persistentes
* `nicalogistics_db_data`: Persistencia de base de datos PostgreSQL.
* `nicalogistics_uploads`: Almacenamiento seguro de imágenes de productos y catálogos.
* `nicalogistics_db_backups`: Depósito seguro de respaldos diarios cifrados (`.sql.gz.enc`).

---

## 3. Despliegue en Producción en un Solo Comando

### Prerrequisitos
* Docker Engine 24.0+ y Docker Compose v2.
* Puerto 80 y 443 disponibles en el host.

### Comando Único de Despliegue
Desde la raíz del repositorio (`UNI-SISTEMAS-ADMINISTRACION`):

```bash
docker compose up -d --build
```

O en Windows PowerShell:
```powershell
docker compose up -d --build
```

El script de inicio:
1. Compila la imagen multi-etapa de backend .NET 9 y frontend Next.js.
2. Inicializa PostgreSQL creando automáticamente las 12 tablas, triggers e índices (`init.sql`).
3. Carga los roles, usuarios cifrados y catálogo semilla (`seed.sql`).
4. Inicia NGINX configurando el proxy inverso con certificados SSL.
5. Inicia el contenedor cron de copias de seguridad automatizadas.

---

## 4. Credenciales de Acceso y Roles del Sistema

Todas las contraseñas han sido cifradas utilizando **BCrypt Work Factor 12** (Política 6):

| Rol | Correo Electrónico | Contraseña Predeterminada | Alcance y Permisos |
| :--- | :--- | :--- | :--- |
| **Admin** | `davismunoz165@gmail.com` | `Admin123*` | Control total, usuarios, roles, suspensión de cuentas, catálogo, inventario, auditoría. |
| **Vendedor** | `vendedor@nicalogistics.com` | `Vendedor123*` | CRM de clientes, creación y edición de productos, categorías, pedidos. |
| **Logística** | `logistica@nicalogistics.com` | `Logistica123*` | Tablero Kanban de encomiendas, actualización de estados de tracking, entrega en ventanilla. |
| **Cliente** | `cliente@gmail.com` | `Cliente123*` | Catálogo público, carrito, checkout sede a sede, mis pedidos, portal de rastreo. |

---

## 5. Módulos y Flujos Operativos

### 5.1 Catálogo y Control de Stock (RF-05, RF-07)
* Acceso en `/catalogo`.
* Carga optimizada menor a 2 segundos mediante índices B-Tree SQL.
* Alerta visual prominente (`alert-amber` #F59E0B) cuando el stock es igual o menor al stock mínimo.
* Bloqueo estricto que impide agregar al carrito cantidades superiores a la existencia real.

### 5.2 Carrito y Checkout "Sede a Sede" (RF-08)
* Acceso en `/carrito` y `/checkout`.
* Obligatoriedad de seleccionar `Sede de Origen` y `Sede de Destino` diferentes (`chk_sedes_diferentes`).
* Procesamiento atómico de pedidos:
  1. Deducción inmediata de stock físico.
  2. Registro inmutable en Kardex (`movimientos_inventario` tipo `VENTA`).
  3. Registro de pago aprobado en tabla `pagos`.
  4. Disparo automático de encomienda logística en estado `REGISTRADA` con código de tracking `NL-2026-XXXXX`.

### 5.3 Portal de Rastreo del Cliente (RF-10)
* Acceso en `/rastreo` o con parámetro directo `/rastreo?code=NL-2026-XXXXX`.
* Timeline visual responsivo con los 4 hitos operativos:
  1. `REGISTRADA` (Azul corporativo #1A56DB)
  2. `EN_TRANSITO` (Ámbar de precaución #F59E0B)
  3. `LISTA_PARA_RETIRO` (Verde esmeralda #10B981)
  4. `ENTREGADA` (Gris / Verde completado)

### 5.4 Panel Kanban Logístico y Entrega en Ventanilla
* Acceso en `/panel/logistica`.
* Filtrado en tiempo real por sucursal.
* Avance de paquetes a través de columnas de estado.
* Al marcar un paquete como `LISTA_PARA_RETIRO`: Se dispara automáticamente el servicio de notificación por correo al cliente informándole los datos de la sucursal de retiro.
* Al marcar un paquete como `ENTREGADA`: Se registra de forma inmutable el ID del empleado que atendió la ventanilla y el timestamp UTC exacto. El paquete queda bloqueado contra alteraciones futuras.

### 5.5 Cancelaciones y Reembolsos (RF-14)
* Acceso en `/mis-pedidos`.
* Al pulsar "Cancelar Pedido":
  1. Se devuelve automáticamente el stock al inventario con movimiento Kardex `CANCELACION`.
  2. La encomienda asociada pasa inmediatamente a estado `CANCELADA`.
  3. El pago asociado se marca como `REEMBOLSADO`.

---

## 6. Mantenimiento y Procedimientos de Soporte Técnico

### 6.1 Respaldos de Base de Datos Manuales y Restauración
Para generar un respaldo manual:
```bash
./scripts/backup-database.sh
```
O en Windows PowerShell:
```powershell
.\scripts\backup-database.ps1
```

Para restaurar una copia de seguridad:
```bash
docker exec -i nicalogistics-db psql -U nicalogistics_user -d nicalogistics_db < backups/nicalogistics_db_YYYYMMDD.sql
```

### 6.2 Auditoría de Seguridad y Logs
Para auditar intentos no autorizados y acciones del personal:
1. Acceder a Swagger en `https://localhost/swagger` con token de Administrador.
2. Consultar `GET /api/audit` para visualizar la tabla `logs_auditoria` con IP de origen, usuario, módulo, acción y fecha.
3. Ejecutar script de prueba de intrusión:
```powershell
.\scripts\audit-access-security.ps1
```

### 6.3 Verificación de Tiempos de Respuesta (RNF-02)
Para comprobar que los tiempos de respuesta del catálogo y rastreo se mantienen por debajo de los 2000 ms:
```powershell
.\scripts\benchmark-performance.ps1
```

---

## 7. Registro de Soporte y Contacto Operativo

Para escalamiento de incidencias operativas:
* **Mesa de Ayuda TI NicaLogistics:** soporte@nicalogistics.com
* **Monitoreo de Infraestructura:** Centro de Operaciones TI - Sede Central Managua
* **Teléfono de Soporte Corporativo:** +505 2270-0000 / Ext. 104
