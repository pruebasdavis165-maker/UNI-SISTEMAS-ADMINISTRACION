using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly IPaymentGatewayService _paymentGateway;
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        AppDbContext context,
        IPaymentGatewayService paymentGateway,
        IEmailService emailService,
        ILogger<OrderService> logger)
    {
        _context = context;
        _paymentGateway = paymentGateway;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(Guid clienteId, CreateOrderDto dto)
    {
        if (dto.Items == null || !dto.Items.Any())
            throw new InvalidOperationException("El pedido debe contener al menos un producto.");

        // Regla Operativa: Se permite Pickup Local (SedeOrigenId == SedeDestinoId) para retiro en la misma sucursal
        var isLocalPickup = dto.SedeOrigenId == dto.SedeDestinoId;

        var sedeOrigen = await _context.Sedes.FirstOrDefaultAsync(s => s.Id == dto.SedeOrigenId && s.Activo);
        if (sedeOrigen == null)
            throw new KeyNotFoundException("La Sede de Origen seleccionada no es válida o está inactiva.");

        var sedeDestino = isLocalPickup
            ? sedeOrigen
            : await _context.Sedes.FirstOrDefaultAsync(s => s.Id == dto.SedeDestinoId && s.Activo);

        if (sedeDestino == null)
            throw new KeyNotFoundException("La Sede de Destino seleccionada no es válida o está inactiva.");

        var cliente = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == clienteId && u.Activo);

        if (cliente == null)
            throw new KeyNotFoundException("Cliente no encontrado.");

        // Regla de Seguridad RF-Checkout: Exclusivo para el rol Cliente
        var roleName = cliente.Rol?.Nombre ?? "";
        if (cliente.RolId != 4 && !roleName.Equals("Cliente", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Los roles administrativos o internos no pueden realizar compras de clientes.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var productIds = dto.Items.Select(i => i.ProductoId).Distinct().ToList();
            var products = await _context.Productos
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            if (products.Count != productIds.Count)
                throw new InvalidOperationException("Uno o más productos no existen en el catálogo.");

            var orderNumber = $"NL-ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
            var order = new Order
            {
                NumeroPedido = orderNumber,
                ClienteId = clienteId,
                SedeOrigenId = dto.SedeOrigenId,
                SedeDestinoId = dto.SedeDestinoId,
                Estado = "PAGADO", // Flujo de e-commerce con confirmación inmediata
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            decimal grandTotal = 0m;
            decimal totalWeight = 0m;
            var orderItems = new List<OrderItem>();
            var movements = new List<InventoryMovement>();
            var lowStockProducts = new List<Product>();

            foreach (var itemReq in dto.Items)
            {
                var prod = products.First(p => p.Id == itemReq.ProductoId);

                if (!prod.Activo)
                    throw new InvalidOperationException($"El producto '{prod.Nombre}' no está disponible.");

                if (itemReq.Cantidad <= 0)
                    throw new InvalidOperationException($"La cantidad para '{prod.Nombre}' debe ser mayor a cero.");

                if (prod.StockActual < itemReq.Cantidad)
                    throw new InvalidOperationException($"Stock insuficiente para '{prod.Nombre}'. Disponibles: {prod.StockActual}, solicitados: {itemReq.Cantidad}.");

                var subtotal = prod.Precio * itemReq.Cantidad;
                grandTotal += subtotal;

                var itemWeight = (prod.PesoLibras > 0 ? prod.PesoLibras : 1.0m) * itemReq.Cantidad;
                totalWeight += itemWeight;

                var orderItem = new OrderItem
                {
                    PedidoId = order.Id,
                    ProductoId = prod.Id,
                    Cantidad = itemReq.Cantidad,
                    PrecioUnitario = prod.Precio,
                    Subtotal = subtotal,
                                    };
                orderItems.Add(orderItem);

                // Descuento atómico de stock e inserción de Kardex (RF-07)
                var stockAnterior = prod.StockActual;
                prod.StockActual -= itemReq.Cantidad;
                prod.ActualizadoEn = DateTime.UtcNow;

                if (prod.StockActual <= prod.StockMinimo)
                {
                    lowStockProducts.Add(prod);
                }

                movements.Add(new InventoryMovement
                {
                    ProductoId = prod.Id,
                    TipoMovimiento = "VENTA",
                    Cantidad = itemReq.Cantidad,
                    StockAnterior = stockAnterior,
                    StockNuevo = prod.StockActual,
                    Motivo = $"Venta en pedido {orderNumber} para retiro en {sedeDestino.Nombre}",
                    UsuarioId = clienteId,
                    Fecha = DateTime.UtcNow
                });
            }

            // Validación atómica de pasarela de pagos (Stripe Sandbox)
            if (string.Equals(dto.MetodoPago, "TARJETA", StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrWhiteSpace(dto.ReferenciaTransaccion) &&
                dto.ReferenciaTransaccion.StartsWith("pi_"))
            {
                var verification = await _paymentGateway.VerifyPaymentAsync(dto.ReferenciaTransaccion);
                if (!verification.IsSuccessful)
                {
                    throw new InvalidOperationException($"La pasarela de pagos Stripe no ha confirmado el cobro. Estado: {verification.Status}. {verification.FailureMessage}");
                }
            }

            // Cálculo de Flete según regla logística multidireccional
            decimal costoEnvio = 0m;
            string modalidadEnvio = "Terrestre Estándar";

            if (isLocalPickup)
            {
                costoEnvio = 0.00m;
                modalidadEnvio = "Pickup en Ventanilla (Local)";
            }
            else
            {
                var paisOrigen = sedeOrigen.Pais.Trim().ToLowerInvariant();
                var paisDestino = sedeDestino.Pais.Trim().ToLowerInvariant();

                if (paisOrigen == "nicaragua" && paisDestino == "nicaragua")
                {
                    modalidadEnvio = "Terrestre Estándar";
                    var terrestre = await _context.FormasEnvio
                        .FirstOrDefaultAsync(f => f.Codigo == "TERRESTRE_NAC" && f.Activo);
                    var tBase = terrestre?.TarifaBase ?? 3.00m;
                    var tLibra = terrestre?.TarifaPorLibra ?? 0.75m;
                    costoEnvio = Math.Round(tBase + (totalWeight * tLibra), 2);
                }
                else
                {
                    var reqMod = dto.ModalidadEnvio?.Trim().ToUpperInvariant() ?? "MARITIMO_INT";
                    var forma = await _context.FormasEnvio
                        .FirstOrDefaultAsync(f => (f.Codigo == reqMod || f.Nombre.ToUpper() == reqMod) && f.Activo);

                    if (forma == null)
                    {
                        if (reqMod.Contains("AEREO") || reqMod.Contains("AÉREO"))
                        {
                            forma = await _context.FormasEnvio.FirstOrDefaultAsync(f => f.Codigo == "AEREO_INT" && f.Activo)
                                ?? new FormaEnvio { Nombre = "Aéreo Exprés", TarifaBase = 20.00m, TarifaPorLibra = 4.50m };
                        }
                        else
                        {
                            forma = await _context.FormasEnvio.FirstOrDefaultAsync(f => f.Codigo == "MARITIMO_INT" && f.Activo)
                                ?? new FormaEnvio { Nombre = "Marítimo Económico", TarifaBase = 10.00m, TarifaPorLibra = 1.85m };
                        }
                    }

                    modalidadEnvio = forma.Nombre;
                    costoEnvio = Math.Round(forma.TarifaBase + (totalWeight * forma.TarifaPorLibra), 2);
                }
            }

            order.CostoEnvio = costoEnvio;
            order.ModalidadEnvio = modalidadEnvio;
            order.PesoTotalLibras = totalWeight;
            order.Total = grandTotal + costoEnvio;
            order.Detalles = orderItems;

            await _context.Pedidos.AddAsync(order);
            await _context.MovimientosInventario.AddRangeAsync(movements);

            // Registro de Pago (RF-11)
            var payment = new Payment
            {
                PedidoId = order.Id,
                Monto = order.Total,
                MetodoPago = string.IsNullOrWhiteSpace(dto.MetodoPago) ? "TARJETA" : dto.MetodoPago.ToUpper(),
                ReferenciaTransaccion = dto.ReferenciaTransaccion ?? $"TX-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
                Estado = "APROBADO",
                FechaPago = DateTime.UtcNow
            };
            await _context.Pagos.AddAsync(payment);

            // Trigger Automático de Encomienda (RF-08, Milestone 5)
            // Si es Pickup Local (Origen == Destino), la encomienda inicia directamente en "LISTA_PARA_RETIRO"
            // Si es Despacho Bilateral (Origen != Destino), inicia en "REGISTRADA" para transporte internacional
            var trackingCode = $"NL-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(10000, 99999)}";
            var initialShipmentState = isLocalPickup ? "LISTA_PARA_RETIRO" : "REGISTRADA";

            var shipment = new Shipment
            {
                CodigoTracking = trackingCode,
                PedidoId = order.Id,
                ClienteId = clienteId,
                SedeOrigenId = dto.SedeOrigenId,
                SedeDestinoId = dto.SedeDestinoId,
                Estado = initialShipmentState,
                FechaRegistro = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };
            await _context.Encomiendas.AddAsync(shipment);

            // Primer hito en Historial de Tracking (RF-10)
            var history = new TrackingHistory
            {
                EncomiendaId = shipment.Id,
                Estado = initialShipmentState,
                UbicacionSedeId = dto.SedeDestinoId,
                Comentario = isLocalPickup
                    ? $"Pickup Local en {sedeDestino.Nombre}. Mercancía verificada y disponible de inmediato para retiro en ventanilla oficial."
                    : $"Encomienda generada automáticamente tras confirmación de pago de orden {orderNumber}. Origen: {sedeOrigen.Nombre}, Destino final para retiro: {sedeDestino.Nombre}.",
                RegistradoPorId = clienteId,
                Fecha = DateTime.UtcNow
            };
            await _context.HistorialTracking.AddAsync(history);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Despacho Inmediato de Correo Transaccional (Resend API)
            try
            {
                if (!string.IsNullOrWhiteSpace(cliente.Email))
                {
                    var emailItems = orderItems.Select(i => (
                        ProductName: products.FirstOrDefault(p => p.Id == i.ProductoId)?.Nombre ?? "Producto",
                        Quantity: i.Cantidad,
                        Subtotal: i.Subtotal
                    )).ToList();

                    _logger.LogInformation("Despachando recibo de compra Resend para orden {OrderNumber} a {Email}", orderNumber, cliente.Email);

                    await _emailService.SendOrderReceiptEmailAsync(
                        to: cliente.Email,
                        clientName: cliente.NombreCompleto,
                        orderNumber: orderNumber,
                        trackingCode: trackingCode,
                        total: order.Total,
                        sedeOrigen: sedeOrigen.Nombre,
                        sedeDestino: sedeDestino.Nombre,
                        items: emailItems,
                        costoEnvio: order.CostoEnvio,
                        modalidadEnvio: order.ModalidadEnvio,
                        pesoTotalLibras: order.PesoTotalLibras
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar recibo de compra Resend para orden {OrderNumber}", orderNumber);
            }

            // Alertas de Stock Bajo (Administrador)
            if (lowStockProducts.Any())
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        foreach (var p in lowStockProducts)
                        {
                            await _emailService.SendLowStockAlertEmailAsync(
                                productName: p.Nombre,
                                sku: p.CodigoSku,
                                currentStock: p.StockActual,
                                minStock: p.StockMinimo
                            );
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error al enviar alertas de stock bajo para orden {OrderNumber}", orderNumber);
                    }
                });
            }

            return await BuildOrderResponseAsync(order.Id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> GetOrderByIdAsync(Guid orderId, Guid? requestingUserId, string userRole)
    {
        var order = await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.SedeOrigen)
            .Include(p => p.SedeDestino)
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(p => p.Id == orderId);

        if (order == null)
            throw new KeyNotFoundException("Pedido no encontrado.");

        if (userRole != "Admin" && userRole != "Vendedor" && userRole != "Logística")
        {
            if (requestingUserId.HasValue && order.ClienteId != requestingUserId.Value)
                throw new UnauthorizedAccessException("No tienes autorización para ver este pedido.");
        }

        return await BuildOrderResponseAsync(orderId);
    }

    public async Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(Guid clienteId)
    {
        var orderIds = await _context.Pedidos
            .Where(p => p.ClienteId == clienteId)
            .OrderByDescending(p => p.CreadoEn)
            .Select(p => p.Id)
            .ToListAsync();

        var list = new List<OrderResponseDto>();
        foreach (var id in orderIds)
        {
            list.Add(await BuildOrderResponseAsync(id));
        }
        return list;
    }

    public async Task<IEnumerable<OrderResponseDto>> GetAllOrdersAsync(string? estado = null)
    {
        var query = _context.Pedidos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(estado))
            query = query.Where(p => p.Estado == estado.ToUpper());

        var orderIds = await query
            .OrderByDescending(p => p.CreadoEn)
            .Select(p => p.Id)
            .ToListAsync();

        var list = new List<OrderResponseDto>();
        foreach (var id in orderIds)
        {
            list.Add(await BuildOrderResponseAsync(id));
        }
        return list;
    }

    public async Task<OrderResponseDto> CancelOrderAsync(Guid orderId, Guid userId, string userRole, string? motivo)
    {
        var order = await _context.Pedidos
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(p => p.Id == orderId);

        if (order == null)
            throw new KeyNotFoundException("Pedido no encontrado.");

        if (order.Estado == "CANCELADO")
            throw new InvalidOperationException("El pedido ya se encuentra cancelado.");

        // Restricción Estricta de Cancelación: Un pedido ÚNICAMENTE puede ser cancelado si su encomienda está en 'REGISTRADA'
        var shipmentCheck = await _context.Encomiendas.FirstOrDefaultAsync(e => e.PedidoId == order.Id);
        if (shipmentCheck != null)
        {
            var normalizedShipmentState = shipmentCheck.Estado.Trim().ToUpper();
            if (normalizedShipmentState != "REGISTRADA")
            {
                throw new InvalidOperationException(
                    $"No se puede cancelar el pedido porque la encomienda asociada ya se encuentra en estado '{shipmentCheck.Estado}'. Únicamente se permite cancelar pedidos cuya encomienda esté estrictamente en estado 'Registrada' en sede de origen.");
            }
        }

        if (userRole != "Admin" && userRole != "Vendedor" && order.ClienteId != userId)
            throw new UnauthorizedAccessException("No tienes permisos para cancelar este pedido.");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            order.Estado = "CANCELADO";
            order.ActualizadoEn = DateTime.UtcNow;

            // Reingreso automático de stock al inventario y registro en Kardex (RF-14)
            var movements = new List<InventoryMovement>();
            foreach (var detail in order.Detalles)
            {
                if (detail.Producto != null)
                {
                    var stockAnterior = detail.Producto.StockActual;
                    detail.Producto.StockActual += detail.Cantidad;
                    detail.Producto.ActualizadoEn = DateTime.UtcNow;

                    movements.Add(new InventoryMovement
                    {
                        ProductoId = detail.ProductoId,
                        TipoMovimiento = "CANCELACION",
                        Cantidad = detail.Cantidad,
                        StockAnterior = stockAnterior,
                        StockNuevo = detail.Producto.StockActual,
                        Motivo = $"Devolución por cancelación de pedido {order.NumeroPedido}. {motivo ?? ""}".Trim(),
                        UsuarioId = userId,
                        Fecha = DateTime.UtcNow
                    });
                }
            }

            await _context.MovimientosInventario.AddRangeAsync(movements);

            // Actualizar Encomienda asociada si existe
            var shipment = await _context.Encomiendas.FirstOrDefaultAsync(e => e.PedidoId == order.Id);
            if (shipment != null)
            {
                shipment.Estado = "CANCELADA";
                shipment.ActualizadoEn = DateTime.UtcNow;

                var history = new TrackingHistory
                {
                    EncomiendaId = shipment.Id,
                    Estado = "CANCELADA",
                    Comentario = $"Pedido cancelado. Motivo: {motivo ?? "Cancelado por el usuario"}",
                    RegistradoPorId = userId,
                    Fecha = DateTime.UtcNow
                };
                await _context.HistorialTracking.AddAsync(history);
            }

            // Actualizar Pago
            var payment = await _context.Pagos.FirstOrDefaultAsync(p => p.PedidoId == order.Id);
            if (payment != null)
            {
                payment.Estado = "REEMBOLSADO";
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return await BuildOrderResponseAsync(orderId);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task<OrderResponseDto> BuildOrderResponseAsync(Guid orderId)
    {
        var order = await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.SedeOrigen)
            .Include(p => p.SedeDestino)
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == orderId);

        if (order == null)
            throw new KeyNotFoundException("Pedido no encontrado.");

        var payment = await _context.Pagos.AsNoTracking().FirstOrDefaultAsync(p => p.PedidoId == order.Id);
        var shipment = await _context.Encomiendas.AsNoTracking().FirstOrDefaultAsync(s => s.PedidoId == order.Id);

        var itemDtos = order.Detalles.Select(d => new OrderItemDetailDto(
            d.Id,
            d.ProductoId,
            d.Producto?.Nombre ?? "Producto desconocido",
            d.Producto?.CodigoSku ?? "",
            d.Producto?.ImagenUrl,
            d.Cantidad,
            d.PrecioUnitario,
            d.Subtotal
        )).ToList();

        return new OrderResponseDto(
            order.Id,
            order.NumeroPedido,
            order.ClienteId,
            order.Cliente?.NombreCompleto ?? "Cliente",
            order.Cliente?.Email ?? "",
            order.SedeOrigenId,
            order.SedeOrigen?.Nombre ?? "Sede Origen",
            order.SedeOrigen?.DireccionVentanilla ?? "",
            order.SedeDestinoId,
            order.SedeDestino?.Nombre ?? "Sede Destino",
            order.SedeDestino?.DireccionVentanilla ?? "",
            order.Total,
            order.Estado,
            payment?.MetodoPago,
            shipment?.CodigoTracking,
            order.CreadoEn,
            itemDtos,
            shipment?.Estado,
            order.CostoEnvio,
            order.ModalidadEnvio,
            order.PesoTotalLibras
        );
    }
}
