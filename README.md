# NicaLogistics — Sistema Enterprise de Logística y E-Commerce "Sede a Sede"

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-.NET%209%20Hexagonal-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20App%20Router-black.svg)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue.svg)]()
[![Security](https://img.shields.io/badge/Security-SSL%20%7C%20JWT%20%7C%20BCrypt-magenta.svg)]()

Plataforma corporativa de comercio electrónico y gestión logística internacional y local con modalidad **exclusiva** de entrega **"Sede a Sede"** (Pickup oficial en ventanilla).

---

## 📌 Regla de Negocio Crítica

> **EL SISTEMA NO REALIZA ENVÍOS A DOMICILIO.**  
> Todos los pedidos de compra (Checkout) y traslados de encomiendas operan de forma estricta entre sedes oficiales autorizadas (**Miami Hub ⇄ Managua, León y Estelí**). No existen campos de dirección domiciliaria en ningún módulo de la plataforma. La entrega se realiza presentando identificación oficial en ventanilla.

---

## 🚀 Despliegue Rápido en Producción (Docker Compose)

Levanta todos los servicios (Base de datos, Backend API, Frontend Next.js, NGINX SSL Proxy y Cron de Backups) con un solo comando:

```bash
docker compose up -d --build
```

### URLs de Acceso Local y Producción:
* **Aplicación Web (Frontend):** [https://localhost](https://localhost) o [http://localhost:3000](http://localhost:3000)
* **Documentación Interactiva Swagger / OpenAPI:** [https://localhost/swagger](https://localhost/swagger) o [http://localhost:5000/swagger](http://localhost:5000/swagger)
* **Portal de Rastreo Público:** [https://localhost/rastreo](https://localhost/rastreo)
* **Catálogo Oficial:** [https://localhost/catalogo](https://localhost/catalogo)
* **Panel Administrativo:** [https://localhost/panel](https://localhost/panel)

---

## 🔐 Cuentas de Acceso Predeterminadas (Demo Seed)

Todas las contraseñas están hasheadas con **BCrypt** de acuerdo a la Política 6:

| Rol | Correo Electrónico | Contraseña | Perfil y Acceso |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@nicalogistics.com` | `Admin123*` | Control total, usuarios, roles, suspensión, auditoría |
| **Vendedor** | `vendedor@nicalogistics.com` | `Vendedor123*` | CRM de clientes, catálogo, precios, inventario |
| **Logística** | `logistica@nicalogistics.com` | `Logistica123*` | Tablero Kanban, actualización de tracking, entregas |
| **Cliente** | `cliente@gmail.com` | `Cliente123*` | Catálogo público, compras, mis pedidos, rastreo |

---

## 🎨 Sistema de Diseño Global (Stitch & Tailwind CSS)

* **Tipografías:** `font-montserrat` para títulos (H1-H6) y `font-inter` para cuerpo de texto y tablas.
* **Colores UI con Significado Visual:**
  * `primary-blue` (`#1A56DB`): Confianza, tecnología, botones principales y headers.
  * `accent-magenta` (`#D946EF`): Innovación, acentos interactivos y hover.
  * `alert-amber` (`#F59E0B`): Precaución, alertas de stock mínimo crítico y estado "En Tránsito".
  * `success-green` (`#10B981`): Éxito, estado "Listo para retiro" o "Entregada en ventanilla".
* **Estilo Visual:** Esquinas redondeadas (`rounded-xl`, `rounded-2xl`) y sombras suaves (`shadow-sm`, `shadow-md`, `shadow-xl`) simulando elevación moderna y limpia.

---

## 🗺️ Cobertura de Milestones e Issues Desarrollados

### 🚀 Milestone 1: Infraestructura Docker, Base de Datos y Arquitectura Base (100%)
* [x] **Issue 1.1 (#1):** Orquestación con `docker-compose.yml` (db-server, backend-api, frontend-web en redes aisladas).
* [x] **Issue 1.2 (#2):** Volúmenes persistentes y verificación de datos (`nicalogistics_db_data`, `nicalogistics_uploads`).
* [x] **Issue 1.3 (#3):** Modelado relacional SQL en `database/init.sql` (Sedes, Encomiendas, Pedidos sin domicilios).
* [x] **Issue 1.4 (#4):** Datos iniciales en `database/seed.sql` (4 roles, 4 sedes, contraseñas bcrypt).
* [x] **Issue 1.5 (#5):** Arquitectura Hexagonal en C# .NET 9 (Domain, Application, Infrastructure, Api).
* [x] **Issue 1.6 (#6):** Setup base Frontend Next.js 14 con Tailwind CSS y fuentes Google Fonts.
* [x] **Issue 1.7 (#7):** Biblioteca de componentes UI reutilizables (Button, Input, Card, Modal, Badge, Alert).

### 🔐 Milestone 2: Seguridad, Roles y Landing Page Corporativa (100%)
* [x] **Issue 2.1 (#8):** API de autenticación JWT y autorización basada en 4 roles.
* [x] **Issue 2.2 (#9):** Middleware de rutas protegidas en Next.js (`/admin`, `/panel`, `/checkout`) con página `/403`.
* [x] **Issue 2.3 (#10):** Landing Page responsiva en Stitch con diagrama interactivo Sede a Sede y calculadora de flete.
* [x] **Issue 2.4 (#11):** Módulo de trazabilidad y auditoría de eventos de usuario en BD (`logs_auditoria`).
* [x] **Issue 2.5 (#12):** CRUD de usuarios y roles en backend con Soft Delete (`toggle-status`).
* [x] **Issue 2.6 (#13):** Dashboard de gestión de usuarios en frontend con modales de alta y suspensión.

### 📦 Milestone 3: Core E-commerce (Catálogo, Inventario y Clientes) (100%)
* [x] **Issue 3.1 (#14):** CRUD de categorías y productos en backend y frontend.
* [x] **Issue 3.2 (#15):** Subida de imágenes de productos almacenadas en volumen Docker persistente.
* [x] **Issue 3.3 (#16):** Lógica de inventario, Kardex de movimientos y alertas de stock bajo (`/api/inventario/alertas`).
* [x] **Issue 3.4 (#17):** Panel de inventario con banners de alerta en color `alert-amber`.
* [x] **Issue 3.5 (#18):** Cartera de clientes y CRM 360 con historial de compras y envíos (RF-04).
* [x] **Issue 3.6 (#19):** Vista pública del catálogo en frontend con filtros rápidos y tiempo de respuesta < 2s (RNF-02).

### 🛒 Milestone 4: Ventas, Pagos y Flujo "Sede a Sede" (100%)
* [x] **Issue 4.1 (#20):** Carrito de compras con persistencia en LocalStorage y restricción estricta de stock (RF-05).
* [x] **Issue 4.2 (#21):** Checkout Sede a Sede con selectores obligatorios de Sede Origen y Destino (0 direcciones domiciliarias).
* [x] **Issue 4.3 (#22):** Procesamiento atómico de pedidos, deducción de stock en BD (RF-07) y registro de pago (RF-11).
* [x] **Issue 4.4 (#23):** Trigger automático de encomienda logística al confirmar pago, generando código de tracking `NL-2026-XXXXX` (RF-08).
* [x] **Issue 4.5 (#24):** Cancelaciones y reembolsos con reingreso automático de existencias vía Kardex (RF-14).

### ✈️ Milestone 5: Logística, Rastreo y Entregas en Ventanilla (100%)
* [x] **Issue 5.1 (#25):** API de estados de tracking con bitácora inmutable en `historial_tracking`.
* [x] **Issue 5.2 (#26):** Tablero Kanban para empleados logísticos con filtros por sede y avance de estados.
* [x] **Issue 5.3 (#27):** Servicio de notificaciones por correo/consola al activarse el estado "Lista para retiro" (RF-09).
* [x] **Issue 5.4 (#28):** Portal público interactivo de rastreo de cliente con timeline visual corporativo (RF-10).
* [x] **Issue 5.5 (#29):** Protocolo de entrega en ventanilla con registro de operador, fecha UTC y bloqueo de inmutabilidad.

### 🛡️ Milestone 6: Compliance TI, QA y Despliegue Producción (100%)
* [x] **Issue 6.1 (#30):** Proxy inverso NGINX con certificados SSL y redirección 301 forzada a HTTPS (RNF-01).
* [x] **Issue 6.2 (#31):** Script automatizado de copias de seguridad cifradas con AES-256 en volumen `db_backups` (Política 3).
* [x] **Issue 6.3 (#32):** Optimización mediante índices B-Tree SQL y pruebas de rendimiento con tiempos < 2000 ms (RNF-02).
* [x] **Issue 6.4 (#33):** Auditoría final de seguridad validando rechazo HTTP 403 para usuarios con rol Cliente (Política 2).
* [x] **Issue 6.5 (#34):** Documentación interactiva de APIs en Swagger/OpenAPI (`/swagger`) con especificación XML.
* [x] **Issue 6.6 (#35):** Despliegue final automatizado y Manual de Operaciones y Soporte (`MANUAL_SOPORTE.md`).

---

## 📄 Documentación Adicional
* Para directrices completas de mantenimiento, protocolos de contingencia y diagramas de arquitectura, consulta el [Manual de Soporte Técnico](MANUAL_SOPORTE.md).
