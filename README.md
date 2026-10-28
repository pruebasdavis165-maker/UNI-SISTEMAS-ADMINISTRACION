# NicaLogistics Enterprise — Sistema Web Integral de Gestión Comercial y Logística

[![Docker](https://img.shields.io/badge/Docker%20Compose-Orchestrated-blue?logo=docker)](https://www.docker.com/)
[![Backend](https://img.shields.io/badge/.NET%209-Hexagonal%20Architecture-purple?logo=dotnet)](https://dotnet.microsoft.com/)
[![Frontend](https://img.shields.io/badge/Next.js%2014-App%20Router-black?logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/PostgreSQL%2016-ACID%20Compliant-336791?logo=postgresql)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/Security-SSL%20%7C%20HTTPS%20%7C%20JWT-success)](https://nginx.org/)
[![UI/UX](https://img.shields.io/badge/Designed%20with-Stitch%20UI-D946EF)](https://stitch.googleapis.com)

**NicaLogistics Enterprise** es una plataforma corporativa robusta diseñada para centralizar las operaciones de comercio electrónico y la cadena de suministro logístico entre Estados Unidos y Nicaragua. El sistema integra catálogo de productos en tiempo real, inventario con Kardex automatizado, pasarela de pago atómica, emisión y seguimiento de encomiendas y un panel logístico Kanban para operadores de ventanilla.

---

## ⚠️ Regla de Negocio Crítica: Modelo Estrictamente "Sede a Sede"

> ### **EL SISTEMA NO REALIZA ENVÍOS A DOMICILIO.**
> 
> Todos los flujos logísticos, de compra (Checkout) y de transporte de carga se basan **exclusivamente en entregas "Sede a Sede" (Pickup en ventanilla oficial)**. 
> * **Cero campos de dirección domiciliaria:** No existen campos de calle, número residencial ni código postal en ningún formulario ni tabla de la base de datos.
> * **Retiro protegido:** La entrega de paquetes se realiza únicamente en las ventanillas de las dos sucursales oficiales autorizadas (**Sede Miami Hub ⇄ Sede Central Managua**), previa verificación de documento de identidad oficial (Cédula o Pasaporte) del titular o destinatario. Flujo comercial bidireccional continuo (Nicaragua ➔ EE.UU. y EE.UU. ➔ Nicaragua).

---

## 📋 Prerrequisitos

Para ejecutar el sistema en cualquier entorno local de desarrollo o producción, únicamente se requiere:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows / macOS) o **Docker Engine 24.0+** con el plugin `docker compose` (Linux).
2. Asegurarse de que el motor de Docker esté en ejecución (*Docker Daemon running*).
3. Tener libres los puertos **80**, **443**, **3000** y **5000** en el equipo anfitrión.

---

## 🚀 Instrucciones de Ejecución (Paso a Paso)

### 1. Clonación y Navegación al Repositorio
Abre una terminal o PowerShell y colócate en la raíz del proyecto:

```bash
git clone https://github.com/pruebasdavis165-maker/UNI-SISTEMAS-ADMINISTRACION.git
cd UNI-SISTEMAS-ADMINISTRACION
```

### 2. Despliegue del Ecosistema Completo (Comando Raíz)
Ejecuta el siguiente comando para orquestar, compilar y levantar automáticamente los 5 contenedores en segundo plano (`-d`) forzando la construcción de imágenes (`--build`):

```bash
docker compose up -d --build
```

Este comando único realiza de manera desatendida:
1. **Base de Datos (`db-server`):** Inicializa PostgreSQL 16 en red interna aislada, ejecuta scripts de esquema relacional (`init.sql`) y carga de datos semilla con roles y catálogo inicial (`seed.sql`).
2. **Servicio de Respaldos (`db-backup`):** Configura un cron job diario con cifrado AES-256 y compresión GZIP hacia el volumen persistente `db_backups`.
3. **Backend API (`backend-api`):** Compila la API en .NET 9 C# bajo Arquitectura Hexagonal y expone los servicios en red interna.
4. **Frontend Web (`frontend-web`):** Compila e inicia la aplicación Next.js 14 en modo optimizado de producción.
5. **Proxy Inverso SSL (`reverse-proxy`):** Inicia NGINX con certificados TLS, redirigiendo automáticamente todo el tráfico HTTP (puerto 80) hacia HTTPS (puerto 443).

### 3. Reinicio Limpio y Solución de Conflictos
Si en algún momento requieres reiniciar el entorno desde cero, limpiar volúmenes o restablecer los datos de prueba de la base de datos:

```bash
# 1. Detener contenedores y eliminar volúmenes persistentes
docker compose down -v

# 2. Reconstruir y levantar el sistema limpiamente
docker compose up -d --build
```

---

## 🌐 Guía de Acceso y URLs Oficiales

El sistema cuenta con un **Proxy Inverso (NGINX)** que actúa como gateway perimetral de seguridad estricta, aplicando certificados SSL y redirección 301 forzada a HTTPS (Cumplimiento de Seguridad RNF-01):

| Módulo del Sistema | URL Primaria (Segura HTTPS) | URL Directa de Contenedor | Descripción |
| :--- | :--- | :--- | :--- |
| **Frontend Web** (Landing & Tienda) | **[https://localhost](https://localhost)** | `http://localhost:3000` | Página de inicio institucional, catálogo público, carrito y checkout Sede a Sede. |
| **Documentación API** (Swagger OpenAPI) | **[https://localhost/swagger](https://localhost/swagger)** | `http://localhost:5000/swagger` | Especificación interactiva OpenAPI con autenticación JWT Bearer y esquema XML. |
| **Portal de Rastreo del Cliente** | **[https://localhost/rastreo](https://localhost/rastreo)** | `http://localhost:3000/rastreo` | Buscador público de encomiendas con timeline visual interactivo corporativo. |
| **Panel de Control Administrativo** | **[https://localhost/panel](https://localhost/panel)** | `http://localhost:3000/panel` | Gestión de usuarios, inventario, categorías, productos y CRM de clientes. |
| **Tablero Kanban Logístico** | **[https://localhost/panel/logistica](https://localhost/panel/logistica)** | `http://localhost:3000/panel/logistica` | Despacho y recepción de paquetes en sedes, avance de estados y entrega en ventanilla. |

> 🔒 **Nota sobre Certificados SSL en Desarrollo Local:**  
> Al acceder por primera vez mediante `https://localhost`, tu navegador web (Chrome, Edge, Firefox) podría mostrar una advertencia de seguridad indicando que el certificado es autofirmado por la entidad corporativa interna de NicaLogistics.  
> **Para continuar:** Haz clic en **"Configuración avanzada"** (o *"More details"*) y luego selecciona **"Continuar a localhost (no seguro)"**. El candado HTTPS quedará activo y cifrará todas las transmisiones de datos.

---

## 🔑 Credenciales y Cuentas de Acceso Predeterminadas

La base de datos se inicializa automáticamente con usuarios de prueba para cada uno de los 4 roles del sistema. Todas las contraseñas están protegidas con algoritmo **BCrypt Work Factor 12** (Política 6):

| Rol | Correo Electrónico | Contraseña | Alcance Operativo |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@nicalogistics.com` | `Admin123*` | Control total del sistema, gestión de usuarios, roles, suspensión de cuentas y bitácora de auditoría. |
| **Vendedor** | `vendedor@nicalogistics.com` | `Vendedor123*` | Gestión del catálogo, precios, creación de productos/categorías y CRM 360 de clientes. |
| **Logística** | `logistica@nicalogistics.com` | `Logistica123*` | Operador de ventanilla: Tablero Kanban, actualización de estados de encomienda y entrega física. |
| **Cliente** | `cliente@gmail.com` | `Cliente123*` | Exploración de catálogo, carrito de compras, órdenes Sede a Sede y seguimiento de paquetes. |

---

## 🏗️ Stack Tecnológico y Arquitectura de Software

El sistema fue diseñado bajo estándares de ingeniería de software empresarial, alta cohesión y bajo acoplamiento:

```
                            [ Cliente Web / Móvil ]
                                       │ (HTTPS / TLS 1.3)
                                       ▼
                       ┌───────────────────────────────┐
                       │   NGINX Reverse Proxy (SSL)   │
                       └──────┬─────────────────┬──────┘
                              │                 │
                (Frontend /)  ▼                 ▼  (API /api/*)
               ┌─────────────────────┐   ┌─────────────────────────────┐
               │    Next.js 14 Web   │   │  Backend .NET 9 (Hexagonal) │
               │   Tailwind + Stitch │   │   DDD / Clean Architecture  │
               └─────────────────────┘   └──────────────┬──────────────┘
                                                        │
                                                        │ (Red interna segura)
                                                        ▼
                                         ┌─────────────────────────────┐
                                         │  PostgreSQL 16 Database     │
                                         │  + Backup Cifrado AES-256   │
                                         └─────────────────────────────┘
```

### 1. Backend: C# .NET 9 (Clean Hexagonal Architecture & DDD)
Estructurado en 4 capas estrictamente desacopladas:
* **`NicaLogistics.Domain`**: Entidades ricas de negocio (`Sede`, `User`, `Product`, `Order`, `Shipment`, `TrackingHistory`), enumeraciones y reglas invariantes (Domain-Driven Design).
* **`NicaLogistics.Application`**: Casos de uso, DTOs inmutables (`records`), contratos de servicios (`IOrderService`, `IShipmentService`, `IInventoryService`, etc.) y lógica de orquestación.
* **`NicaLogistics.Infrastructure`**: Implementación de persistencia con Entity Framework Core 9 sobre PostgreSQL, hashing con BCrypt, generación de tokens JWT, servicio de notificaciones y jobs de mantenimiento.
* **`NicaLogistics.Api`**: Controladores RESTful, middleware de auditoría de seguridad (`AuditLoggingMiddleware`), validación de claims/roles y documentación Swagger/OpenAPI enriquecida con XML.

### 2. Frontend: Next.js 14 App Router + Stitch UI/UX
* **Renderizado Híbrido:** Arquitectura React Server Components y Client Components con optimización estática previa (< 2s de tiempo de respuesta RNF-02).
* **Sistema de Diseño Stitch:** Diseñado en la plataforma **Stitch**, garantizando interfaces modernas, limpias, accesibles e intuitivas con elevación suave (`shadow-md`, `shadow-xl`) y esquinas redondeadas (`rounded-xl`, `rounded-2xl`).
* **Tipografías Corporativas:** `Montserrat` para encabezados y llamadas a la acción; `Inter` para cuerpos de texto, tablas operativas y reportes.
* **Paleta de Colores con Propósito Visual:**
  * `primary-blue` (`#1A56DB`): Confianza, tecnología y botones de acción principal.
  * `accent-magenta` (`#D946EF`): Innovación, acentos visuales y estados interactivos hover.
  * `alert-amber` (`#F59E0B`): Precaución, alertas de stock mínimo crítico y estado *"En Tránsito"*.
  * `success-green` (`#10B981`): Éxito, confirmación de retiros y estado *"Listo para Retiro"* / *"Entregada"*.

### 3. Base de Datos & DevOps
* **PostgreSQL 16:** Esquema relacional normalizado con soporte UUID v4 nativo (`pgcrypto`).
* **Aislamiento de Red:** La base de datos no expone ningún puerto al exterior del host, siendo accesible únicamente por la red interna Docker `internal-net`.
* **Respaldos Automatizados (Política 3):** Contenedor secundario con ejecución programada diaria que comprime los volcados (`pg_dump`) y los cifra con **OpenSSL AES-256-CBC**, aplicando política de retención de 7 días.

---

## 📍 Directorio de Sedes Oficiales Autorizadas

| Código Sede | Nombre de la Sucursal | Ubicación | Dirección de Ventanilla Oficial | Horario de Atención |
| :--- | :--- | :--- | :--- | :--- |
| **`MIA-01`** | **Sede Miami Hub** | Miami, Florida (USA) | 8400 NW 25th St, Doral, FL 33198 (Carga y Recepción) | Lun - Vie 8:00 AM - 5:00 PM |
| **`MGA-01`** | **Sede Central Managua** | Managua, Nicaragua | Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal) | Lun - Sáb 8:00 AM - 6:00 PM |

---

## 🧪 Pruebas Automatizadas y Scripts de Verificación

En la carpeta [`scripts/`](scripts/) se incluyen utilidades listas para ejecución:

* **Pruebas de Rendimiento QA (< 2s, RNF-02):**
  ```powershell
  .\scripts\benchmark-performance.ps1
  ```
* **Auditoría de Seguridad de Accesos (Rechazo 403 a Clientes, Política 2):**
  ```powershell
  .\scripts\audit-access-security.ps1
  ```
* **Verificación de Persistencia de Volúmenes (Política 3):**
  ```powershell
  .\scripts\verify-persistence.ps1
  ```
* **Generación Manual de Respaldo Cifrado de Base de Datos:**
  ```powershell
  .\scripts\backup-database.ps1
  ```

---

## 📖 Documentación Complementaria
Para consultar protocolos de contingencia, diagramas de base de datos detallados y procedimientos de soporte nivel 1, 2 y 3, revisa el archivo [MANUAL_SOPORTE.md](MANUAL_SOPORTE.md).
