namespace NicaLogistics.Domain.Entities;

public class Role
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class Sede
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
    public string Ciudad { get; set; } = string.Empty;
    public string DireccionVentanilla { get; set; } = string.Empty;
    public string? TelefonoContacto { get; set; }
    public string? HorarioAtencion { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NombreCompleto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public int RolId { get; set; }
    public Role? Rol { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
}

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
}

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CodigoSku { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; } = 5;
    public string? ImagenUrl { get; set; }
    public Guid CategoriaId { get; set; }
    public Category? Categoria { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
}

public class InventoryMovement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductoId { get; set; }
    public Product? Producto { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty; // ENTRADA, SALIDA, VENTA, CANCELACION, AJUSTE
    public int Cantidad { get; set; }
    public int StockAnterior { get; set; }
    public int StockNuevo { get; set; }
    public string? Motivo { get; set; }
    public Guid? UsuarioId { get; set; }
    public User? Usuario { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NumeroPedido { get; set; } = string.Empty;
    public Guid ClienteId { get; set; }
    public User? Cliente { get; set; }
    
    // Regla crítica: Exclusivamente Sede a Sede (Sin campos de domicilio)
    public Guid SedeOrigenId { get; set; }
    public Sede? SedeOrigen { get; set; }
    public Guid SedeDestinoId { get; set; }
    public Sede? SedeDestino { get; set; }
    
    public decimal Total { get; set; }
    public string Estado { get; set; } = "PENDIENTE_PAGO"; // PENDIENTE_PAGO, PAGADO, CANCELADO, COMPLETADO
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
    
    public ICollection<OrderItem> Detalles { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PedidoId { get; set; }
    public Order? Pedido { get; set; }
    public Guid ProductoId { get; set; }
    public Product? Producto { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PedidoId { get; set; }
    public Order? Pedido { get; set; }
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = "TARJETA"; // TARJETA, TRANSFERENCIA, VENTANILLA
    public string? ReferenciaTransaccion { get; set; }
    public string Estado { get; set; } = "APROBADO"; // APROBADO, RECHAZADO, REEMBOLSADO
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;
}

public class Shipment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CodigoTracking { get; set; } = string.Empty;
    public Guid PedidoId { get; set; }
    public Order? Pedido { get; set; }
    public Guid ClienteId { get; set; }
    public User? Cliente { get; set; }
    
    public Guid SedeOrigenId { get; set; }
    public Sede? SedeOrigen { get; set; }
    public Guid SedeDestinoId { get; set; }
    public Sede? SedeDestino { get; set; }
    
    public string Estado { get; set; } = "REGISTRADA"; // REGISTRADA, EN_TRANSITO, LISTA_PARA_RETIRO, ENTREGADA
    public Guid? EmpleadoEntregaId { get; set; }
    public User? EmpleadoEntrega { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
    
    public ICollection<TrackingHistory> Historial { get; set; } = new List<TrackingHistory>();
}

public class TrackingHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EncomiendaId { get; set; }
    public Shipment? Encomienda { get; set; }
    public string Estado { get; set; } = string.Empty;
    public Guid? UbicacionSedeId { get; set; }
    public Sede? UbicacionSede { get; set; }
    public string? Comentario { get; set; }
    public Guid? RegistradoPorId { get; set; }
    public User? RegistradoPor { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UsuarioId { get; set; }
    public string? UsuarioEmail { get; set; }
    public string Accion { get; set; } = string.Empty; // POST, PUT, DELETE, LOGIN
    public string Modulo { get; set; } = string.Empty;
    public string? Detalles { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}
