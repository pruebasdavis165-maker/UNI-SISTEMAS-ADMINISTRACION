-- ============================================================================
-- NicaLogistics - Esquema Relacional de Base de Datos (PostgreSQL 16)
-- Modelo Sede a Sede Estricto (Sin campos de entrega a domicilio)
-- Política 6: Cifrado y hashing de datos sensibles
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Roles del Sistema
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- 2. Tabla de Sedes Físicas y Ventanillas de Retiro (Sede a Sede)
CREATE TABLE IF NOT EXISTS sedes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    direccion_ventanilla VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(50),
    horario_atencion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Usuarios y Cuentas (Contraseñas Hasheadas con bcrypt)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    rol_id INT NOT NULL REFERENCES roles(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Productos y Catálogo
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    imagen_url VARCHAR(255),
    categoria_id UUID NOT NULL REFERENCES categorias(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Movimientos de Inventario (Kardex / Entradas y Salidas RF-07)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id),
    tipo_movimiento VARCHAR(30) NOT NULL, -- 'ENTRADA', 'SALIDA', 'VENTA', 'CANCELACION', 'AJUSTE'
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    motivo TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Pedidos (Estrictamente Sede a Sede: Sin direcciones a domicilio)
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    sede_origen_id UUID NOT NULL REFERENCES sedes(id),
    sede_destino_id UUID NOT NULL REFERENCES sedes(id),
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_PAGO', -- 'PENDIENTE_PAGO', 'PAGADO', 'CANCELADO', 'COMPLETADO'
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de Detalles de Pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- 9. Tabla de Pagos (RF-11)
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id),
    monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(50) NOT NULL, -- 'TARJETA', 'TRANSFERENCIA', 'VENTANILLA'
    referencia_transaccion VARCHAR(100),
    estado VARCHAR(50) NOT NULL DEFAULT 'APROBADO', -- 'APROBADO', 'RECHAZADO', 'REEMBOLSADO'
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabla de Encomiendas Logísticas (RF-08, Milestone 5)
CREATE TABLE IF NOT EXISTS encomiendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_tracking VARCHAR(50) UNIQUE NOT NULL,
    pedido_id UUID NOT NULL REFERENCES pedidos(id),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    sede_origen_id UUID NOT NULL REFERENCES sedes(id),
    sede_destino_id UUID NOT NULL REFERENCES sedes(id),
    estado VARCHAR(50) NOT NULL DEFAULT 'REGISTRADA', -- 'REGISTRADA', 'EN_TRANSITO', 'LISTA_PARA_RETIRO', 'ENTREGADA'
    empleado_entrega_id UUID REFERENCES usuarios(id),
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabla de Historial de Tracking (RF-10)
CREATE TABLE IF NOT EXISTS historial_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encomienda_id UUID NOT NULL REFERENCES encomiendas(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL,
    ubicacion_sede_id UUID REFERENCES sedes(id),
    comentario TEXT,
    registrado_por_id UUID REFERENCES usuarios(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabla de Logs de Auditoría (RF-12, Política 6)
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    usuario_email VARCHAR(150),
    accion VARCHAR(50) NOT NULL, -- 'POST', 'PUT', 'DELETE', 'LOGIN', etc.
    modulo VARCHAR(100) NOT NULL,
    detalles TEXT,
    ip_address VARCHAR(50),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Índices para Rendimiento y Optimización (< 2s, RNF-02, Issue 6.3)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_encomiendas_tracking ON encomiendas(codigo_tracking);
CREATE INDEX IF NOT EXISTS idx_encomiendas_cliente ON encomiendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_encomiendas_estado ON encomiendas(estado);
CREATE INDEX IF NOT EXISTS idx_historial_encomienda ON historial_tracking(encomienda_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON logs_auditoria(fecha);
