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

-- 2. Sedes Oficiales (Sede a Sede exclusiva: Managua y Miami)
INSERT INTO sedes (id, codigo, nombre, pais, ciudad, direccion_ventanilla, telefono_contacto, horario_atencion, activo) VALUES
('11111111-1111-1111-1111-111111111111', 'MIA-01', 'Sede Central Miami Hub', 'Estados Unidos', 'Miami', '8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción)', '+1 (305) 555-0199', 'Lun - Vie: 8:00 AM - 5:00 PM', TRUE),
('22222222-2222-2222-2222-222222222222', 'MGA-01', 'Sede Central Managua', 'Nicaragua', 'Managua', 'Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal)', '+505 2249-0100', 'Lun - Sáb: 8:00 AM - 6:00 PM', TRUE)


ON CONFLICT (codigo) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    direccion_ventanilla = EXCLUDED.direccion_ventanilla,
    activo = EXCLUDED.activo;

-- Garantizar que únicamente existan en el sistema las 2 sedes oficiales autorizadas
DELETE FROM sedes WHERE codigo NOT IN ('MIA-01', 'MGA-01');

-- 3. Usuarios Iniciales por Defecto con Password Bcrypt
-- Passwords en texto plano para testing:
-- Admin: Admin123*!
-- Vendedor: Vendedor123*!
-- Logística: Logistica123*!
-- Cliente: Cliente123*!
INSERT INTO usuarios (id, nombre_completo, email, password_hash, telefono, rol_id, activo) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Administrador General NicaLogistics', 'davismunoz165@gmail.com', crypt('Admin123*!', gen_salt('bf', 10)), '+505 8888-0001', 1, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Carlos Mendoza - Vendedor Comercial', 'vendedor@nicalogistics.com', crypt('Vendedor123*!', gen_salt('bf', 10)), '+505 8888-0002', 2, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Roberto Silva - Operador Logístico', 'logistica@nicalogistics.com', crypt('Logistica123*!', gen_salt('bf', 10)), '+505 8888-0003', 3, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Alejandro Morales (Cliente Frecuente)', 'cliente@gmail.com', crypt('Cliente123*!', gen_salt('bf', 10)), '+505 8888-0004', 4, TRUE)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    activo = EXCLUDED.activo;

-- 4. Categorías Iniciales
INSERT INTO categorias (id, nombre, descripcion, activo) VALUES
('c1111111-1111-1111-1111-111111111111', 'Gastronomía y Dulces Tradicionales', 'Rosquillas, cajetas, quesillos y alimentos autóctonos nicaragüenses listos para despacho', TRUE),
('c2222222-2222-2222-2222-222222222222', 'Café Especial y Exportación', 'Café gourmet de estricta altura origen Dipilto, Matagalpa y Jinotega', TRUE),
('c3333333-3333-3333-3333-333333333333', 'Artesanías y Cuero de Masaya', 'Hamacas de cedro tejidas a mano, calzado y manufactura en cuero genuino nicaragüense', TRUE),
('c4444444-4444-4444-4444-444444444444', 'Tecnología e Informática USA', 'Laptops, smartphones y componentes de última generación despachados desde Miami Hub', TRUE)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo = EXCLUDED.activo;

-- 5. Productos Iniciales en Inventario (Gastronomía, Café y Artesanías de Nicaragua + Tecnología USA)
INSERT INTO productos (id, codigo_sku, nombre, descripcion, precio, stock_actual, stock_minimo, imagen_url, categoria_id, activo) VALUES
('00000001-0000-0000-0000-000000000001', 'SKU-NIC-ROSQ01', 'Rosquillas Somoteñas Tradicionales (Bolsa Familiar 500g)', 'Auténticas rosquillas somoteñas de maíz tostado y queso con sabor crujiente tradicional nicaragüense.', 12.00, 40, 10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', 'c1111111-1111-1111-1111-111111111111', TRUE),
('00000001-0000-0000-0000-000000000002', 'SKU-NIC-CAJ01', 'Cajetas de Leche y Manjar Típico (Caja Surtida 12 uds)', 'Dulces tradicionales artesanales elaborados con leche entera, canela y azúcar morena de caña.', 9.50, 35, 8, 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80', 'c1111111-1111-1111-1111-111111111111', TRUE),
('00000001-0000-0000-0000-000000000003', 'SKU-NIC-QUES01', 'Quesillo Artesanal de Santo Tomás (Sellado al Vacío 2 lbs)', 'Quesillo fresco de leche pasteurizada nicaragüense, textura elástica insuperable con conservación en frío.', 18.00, 20, 5, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80', 'c1111111-1111-1111-1111-111111111111', TRUE),
('00000001-0000-0000-0000-000000000004', 'SKU-NIC-NAC01', 'Nacatamales Criollos de Cerdo (Pack 4 uds Congelados al Vacío)', 'Nacatamales tradicionales envueltos en hoja de plátano con masa de maíz condimentada, lomo de cerdo y yerbabuena.', 22.00, 15, 5, 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80', 'c1111111-1111-1111-1111-111111111111', TRUE),
('00000001-0000-0000-0000-000000000005', 'SKU-NIC-CAF01', 'Café Especial de Altura Dipilto Nueva Segovia (Grano 1 lb)', 'Café arábica de estricta altura (SHG) con notas a chocolate amargo, caramelo y acidez cítrica balanceada.', 14.50, 50, 10, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80', 'c2222222-2222-2222-2222-222222222222', TRUE),
('00000001-0000-0000-0000-000000000006', 'SKU-NIC-HAM01', 'Hamaca Matrimonial de Masaya (Tejida a Mano con Barras de Cedro)', 'Hamaca artesanal de hilo de algodón de alta resistencia con flecos decorativos y travesaños de madera fina.', 65.00, 10, 3, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 'c3333333-3333-3333-3333-333333333333', TRUE),
('00000001-0000-0000-0000-000000000007', 'SKU-NIC-BOT01', 'Botas de Cuero Genuino Masaya (Hechas a Mano)', 'Calzado artesanal en cuero vacuno auténtico con costura reforzada y suela antideslizante para alta durabilidad.', 58.00, 14, 4, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 'c3333333-3333-3333-3333-333333333333', TRUE),
('00000001-0000-0000-0000-000000000008', 'SKU-USA-LAP01', 'MacBook Air 15" M3 - 16GB / 512GB SSD (Despacho Miami Hub)', 'Portátil ultraligero con chip Apple M3, pantalla Liquid Retina y hasta 18h de batería. Importación directa.', 1299.00, 8, 2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 'c4444444-4444-4444-4444-444444444444', TRUE),
('00000001-0000-0000-0000-000000000009', 'SKU-USA-PHN01', 'iPhone 15 Pro Max 256GB Titanio Natural (Despacho Miami Hub)', 'Dispositivo iOS con chip A17 Pro, cámara 48MP con teleobjetivo 5x y chasis de titanio de grado aeroespacial.', 1199.00, 6, 2, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', 'c4444444-4444-4444-4444-444444444444', TRUE)
ON CONFLICT (id) DO UPDATE SET 
    codigo_sku = EXCLUDED.codigo_sku,
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    stock_actual = EXCLUDED.stock_actual,
    stock_minimo = EXCLUDED.stock_minimo,
    imagen_url = EXCLUDED.imagen_url,
    categoria_id = EXCLUDED.categoria_id,
    activo = EXCLUDED.activo;

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


-- 5. Formas de Envio Iniciales
INSERT INTO formas_envio (id, nombre, codigo, tipo_ruta, tarifa_base, tarifa_por_libra, tiempo_estimado, descripcion, activo)
VALUES 
  ('f1111111-1111-1111-1111-111111111111', 'Terrestre Estandar', 'TERRESTRE_NAC', 'NACIONAL', 3.00, 0.75, '24 - 48 horas habiles', 'Transporte terrestre seguro entre sedes autorizadas de Nicaragua con resguardo oficial.', TRUE),
  ('f2222222-2222-2222-2222-222222222222', 'Maritimo Economico', 'MARITIMO_INT', 'INTERNACIONAL', 10.00, 1.85, '10 - 15 dias habiles', 'Carga maritima consolidada bilateral Miami - Managua para paqueteria economica.', TRUE),
  ('f3333333-3333-3333-3333-333333333333', 'Aereo Expres', 'AEREO_INT', 'INTERNACIONAL', 20.00, 4.50, '2 - 4 dias habiles', 'Vuelo expres prioritario bilateral con tramite aduanal y entrega rapida en ventanilla.', TRUE)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tarifa_base = EXCLUDED.tarifa_base,
  tarifa_por_libra = EXCLUDED.tarifa_por_libra,
  tiempo_estimado = EXCLUDED.tiempo_estimado,
  descripcion = EXCLUDED.descripcion;
