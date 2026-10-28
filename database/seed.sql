-- ============================================================================
-- NicaLogistics - Datos Semilla Iniciales (Seed Data)
-- Roles, Sedes Principales, Usuarios por Defecto (Hasheados), Categorías y Productos
-- ============================================================================

-- 1. Roles del Sistema
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'Admin', 'Administrador general del sistema con control total y auditoría'),
(2, 'Vendedor', 'Gestión de clientes, catálogo, ventas y seguimiento comercial'),
(3, 'Logística', 'Control de almacén, recepción, tránsito y entrega en ventanilla'),
(4, 'Cliente', 'Consulta de catálogo, checkout Sede a Sede y rastreo de encomiendas')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

-- Sincronizar secuencia de roles si existe
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. Sedes Principales (Sede a Sede exclusiva)
INSERT INTO sedes (id, codigo, nombre, pais, ciudad, direccion_ventanilla, telefono_contacto, horario_atencion, activo) VALUES
('11111111-1111-1111-1111-111111111111', 'MIA-01', 'Sede Central Miami Hub', 'Estados Unidos', 'Miami', '8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción)', '+1 (305) 555-0199', 'Lun - Vie: 8:00 AM - 5:00 PM', TRUE),
('22222222-2222-2222-2222-222222222222', 'MGA-01', 'Sede Central Managua', 'Nicaragua', 'Managua', 'Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal)', '+505 2249-0100', 'Lun - Sáb: 8:00 AM - 6:00 PM', TRUE),
('33333333-3333-3333-3333-333333333333', 'LEO-01', 'Sede Regional León', 'Nicaragua', 'León', 'Costado Sur Iglesia La Recolección, Módulo 3', '+505 2311-4560', 'Lun - Sáb: 8:30 AM - 5:30 PM', TRUE),
('44444444-4444-4444-4444-444444444444', 'EST-01', 'Sede Regional Estelí', 'Nicaragua', 'Estelí', 'De la Catedral 2c al Norte, 1/2c al Este, Ventanilla 1', '+505 2713-8890', 'Lun - Sáb: 8:30 AM - 5:30 PM', TRUE)
ON CONFLICT (codigo) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    direccion_ventanilla = EXCLUDED.direccion_ventanilla;

-- 3. Usuarios Iniciales por Defecto con Password Bcrypt
-- Passwords en texto plano para testing:
-- Admin: Admin123*!
-- Vendedor: Vendedor123*!
-- Logística: Logistica123*!
-- Cliente: Cliente123*!
INSERT INTO usuarios (id, nombre_completo, email, password_hash, telefono, rol_id, activo) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Administrador General NicaLogistics', 'admin@nicalogistics.com', crypt('Admin123*!', gen_salt('bf', 10)), '+505 8888-0001', 1, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Carlos Mendoza - Vendedor Comercial', 'vendedor@nicalogistics.com', crypt('Vendedor123*!', gen_salt('bf', 10)), '+505 8888-0002', 2, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Roberto Silva - Operador Logístico', 'logistica@nicalogistics.com', crypt('Logistica123*!', gen_salt('bf', 10)), '+505 8888-0003', 3, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Alejandro Morales (Cliente Frecuente)', 'cliente@gmail.com', crypt('Cliente123*!', gen_salt('bf', 10)), '+505 8888-0004', 4, TRUE)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    activo = EXCLUDED.activo;

-- 4. Categorías Iniciales
INSERT INTO categorias (id, nombre, descripcion, activo) VALUES
('c1111111-1111-1111-1111-111111111111', 'Electrónica y Laptops', 'Equipos de cómputo, componentes y accesorios de alta gama', TRUE),
('c2222222-2222-2222-2222-222222222222', 'Smartphones y Gadgets', 'Teléfonos inteligentes, relojes y dispositivos portátiles', TRUE),
('c3333333-3333-3333-3333-333333333333', 'Repuestos y Herramientas', 'Piezas automotrices, industriales y herramientas de precisión', TRUE),
('c4444444-4444-4444-4444-444444444444', 'Moda y Accesorios', 'Ropa deportiva, calzado importado y accesorios de viaje', TRUE)
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- 5. Productos Iniciales en Inventario
INSERT INTO productos (id, codigo_sku, nombre, descripcion, precio, stock_actual, stock_minimo, imagen_url, categoria_id, activo) VALUES
('p1111111-1111-1111-1111-111111111111', 'SKU-LAP-001', 'MacBook Air 15" M3 - 16GB / 512GB SSD', 'Portátil ultraligero con chip Apple M3, pantalla Liquid Retina y hasta 18h de batería.', 1299.00, 12, 3, '/images/products/macbook-air.jpg', 'c1111111-1111-1111-1111-111111111111', TRUE),
('p2222222-2222-2222-2222-222222222222', 'SKU-LAP-002', 'Lenovo ThinkPad X1 Carbon Gen 11', 'Portátil empresarial Intel Core i7, 32GB RAM, 1TB NVMe, chasis de fibra de carbono.', 1450.00, 4, 5, '/images/products/thinkpad-x1.jpg', 'c1111111-1111-1111-1111-111111111111', TRUE),
('p3333333-3333-3333-3333-333333333333', 'SKU-PHN-001', 'iPhone 15 Pro Max 256GB Titanio Natural', 'Dispositivo iOS con chip A17 Pro, cámara 48MP con teleobjetivo 5x y puerto USB-C.', 1199.00, 8, 4, '/images/products/iphone-15-pro.jpg', 'c2222222-2222-2222-2222-222222222222', TRUE),
('p4444444-4444-4444-4444-444444444444', 'SKU-PHN-002', 'Samsung Galaxy S24 Ultra 512GB', 'Smartphone Android con Galaxy AI integrada, S-Pen incluido y pantalla Dynamic AMOLED 2X.', 1249.00, 3, 5, '/images/products/s24-ultra.jpg', 'c2222222-2222-2222-2222-222222222222', TRUE),
('p5555555-5555-5555-5555-555555555555', 'SKU-REP-001', 'Kit Scanner Diagnóstico Automotriz OBD2 Bluetooth', 'Herramienta profesional de diagnóstico para lectura de códigos y sensores en tiempo real.', 85.00, 25, 6, '/images/products/obd2-scanner.jpg', 'c3333333-3333-3333-3333-333333333333', TRUE),
('p6666666-6666-6666-6666-666666666666', 'SKU-MOD-001', 'Mochila Antirrobo Resistente al Agua para Laptop 17"', 'Mochila de viaje ergonómica con puerto USB de carga rápida y candado TSA integrado.', 49.99, 30, 8, '/images/products/backpack-pro.jpg', 'c4444444-4444-4444-4444-444444444444', TRUE)
ON CONFLICT (codigo_sku) DO UPDATE SET 
    precio = EXCLUDED.precio,
    stock_actual = EXCLUDED.stock_actual,
    stock_minimo = EXCLUDED.stock_minimo;

-- Registrar Kardex inicial de los productos
INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, usuario_id)
SELECT id, 'ENTRADA', stock_actual, 0, stock_actual, 'Inventario inicial de apertura de operaciones', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
FROM productos
ON CONFLICT DO NOTHING;

-- 6. Ejemplo inicial de Encomienda y Tracking (Para probar de inmediato el rastreo Sede a Sede)
INSERT INTO pedidos (id, numero_pedido, cliente_id, sede_origen_id, sede_destino_id, total, estado) VALUES
('e1111111-1111-1111-1111-111111111111', 'PED-2026-0001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1299.00, 'PAGADO')
ON CONFLICT (numero_pedido) DO NOTHING;

INSERT INTO pagos (pedido_id, monto, metodo_pago, referencia_transaccion, estado) VALUES
('e1111111-1111-1111-1111-111111111111', 1299.00, 'TARJETA', 'TX-SEED-987654', 'APROBADO')
ON CONFLICT DO NOTHING;

INSERT INTO encomiendas (id, codigo_tracking, pedido_id, cliente_id, sede_origen_id, sede_destino_id, estado) VALUES
('f1111111-1111-1111-1111-111111111111', 'NL-2026-DEMO88', 'e1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'EN_TRANSITO')
ON CONFLICT (codigo_tracking) DO NOTHING;

INSERT INTO historial_tracking (encomienda_id, estado, ubicacion_sede_id, comentario, registrado_por_id) VALUES
('f1111111-1111-1111-1111-111111111111', 'REGISTRADA', '11111111-1111-1111-1111-111111111111', 'Paquete recibido en ventanilla de recepción Miami Hub', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('f1111111-1111-1111-1111-111111111111', 'EN_TRANSITO', '11111111-1111-1111-1111-111111111111', 'Despachado en vuelo de carga consolidada con destino a Managua', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;
