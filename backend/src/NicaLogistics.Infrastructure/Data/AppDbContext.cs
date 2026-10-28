using Microsoft.EntityFrameworkCore;
using NicaLogistics.Domain.Entities;

namespace NicaLogistics.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Sede> Sedes => Set<Sede>();
    public DbSet<User> Usuarios => Set<User>();
    public DbSet<Category> Categorias => Set<Category>();
    public DbSet<Product> Productos => Set<Product>();
    public DbSet<InventoryMovement> MovimientosInventario => Set<InventoryMovement>();
    public DbSet<Order> Pedidos => Set<Order>();
    public DbSet<OrderItem> DetallesPedido => Set<OrderItem>();
    public DbSet<Payment> Pagos => Set<Payment>();
    public DbSet<Shipment> Encomiendas => Set<Shipment>();
    public DbSet<TrackingHistory> HistorialTracking => Set<TrackingHistory>();
    public DbSet<AuditLog> LogsAuditoria => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
        });

        modelBuilder.Entity<Sede>(entity =>
        {
            entity.ToTable("sedes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Codigo).HasColumnName("codigo").IsRequired().HasMaxLength(20);
            entity.Property(e => e.Nombre).HasColumnName("nombre").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Pais).HasColumnName("pais").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Ciudad).HasColumnName("ciudad").IsRequired().HasMaxLength(50);
            entity.Property(e => e.DireccionVentanilla).HasColumnName("direccion_ventanilla").IsRequired().HasMaxLength(255);
            entity.Property(e => e.TelefonoContacto).HasColumnName("telefono_contacto").HasMaxLength(50);
            entity.Property(e => e.HorarioAtencion).HasColumnName("horario_atencion").HasMaxLength(100);
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.CreadoEn).HasColumnName("creado_en");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.NombreCompleto).HasColumnName("nombre_completo").IsRequired().HasMaxLength(150);
            entity.Property(e => e.Email).HasColumnName("email").IsRequired().HasMaxLength(150);
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Telefono).HasColumnName("telefono").HasMaxLength(50);
            entity.Property(e => e.RolId).HasColumnName("rol_id");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.CreadoEn).HasColumnName("creado_en");
            entity.Property(e => e.ActualizadoEn).HasColumnName("actualizado_en");

            entity.HasOne(e => e.Rol).WithMany().HasForeignKey(e => e.RolId);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categorias");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.CreadoEn).HasColumnName("creado_en");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("productos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CodigoSku).HasColumnName("codigo_sku").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Nombre).HasColumnName("nombre").IsRequired().HasMaxLength(150);
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.Precio).HasColumnName("precio").HasPrecision(12, 2);
            entity.Property(e => e.StockActual).HasColumnName("stock_actual");
            entity.Property(e => e.StockMinimo).HasColumnName("stock_minimo");
            entity.Property(e => e.ImagenUrl).HasColumnName("imagen_url").HasMaxLength(255);
            entity.Property(e => e.CategoriaId).HasColumnName("categoria_id");
            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.CreadoEn).HasColumnName("creado_en");
            entity.Property(e => e.ActualizadoEn).HasColumnName("actualizado_en");

            entity.HasOne(e => e.Categoria).WithMany().HasForeignKey(e => e.CategoriaId);
        });

        modelBuilder.Entity<InventoryMovement>(entity =>
        {
            entity.ToTable("movimientos_inventario");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.TipoMovimiento).HasColumnName("tipo_movimiento").HasMaxLength(30);
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.StockAnterior).HasColumnName("stock_anterior");
            entity.Property(e => e.StockNuevo).HasColumnName("stock_nuevo");
            entity.Property(e => e.Motivo).HasColumnName("motivo");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.Fecha).HasColumnName("fecha");

            entity.HasOne(e => e.Producto).WithMany().HasForeignKey(e => e.ProductoId);
            entity.HasOne(e => e.Usuario).WithMany().HasForeignKey(e => e.UsuarioId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("pedidos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.NumeroPedido).HasColumnName("numero_pedido").IsRequired().HasMaxLength(50);
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.SedeOrigenId).HasColumnName("sede_origen_id");
            entity.Property(e => e.SedeDestinoId).HasColumnName("sede_destino_id");
            entity.Property(e => e.Total).HasColumnName("total").HasPrecision(12, 2);
            entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(50);
            entity.Property(e => e.CreadoEn).HasColumnName("creado_en");
            entity.Property(e => e.ActualizadoEn).HasColumnName("actualizado_en");

            entity.HasOne(e => e.Cliente).WithMany().HasForeignKey(e => e.ClienteId);
            entity.HasOne(e => e.SedeOrigen).WithMany().HasForeignKey(e => e.SedeOrigenId);
            entity.HasOne(e => e.SedeDestino).WithMany().HasForeignKey(e => e.SedeDestinoId);
            entity.HasMany(e => e.Detalles).WithOne(d => d.Pedido).HasForeignKey(d => d.PedidoId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("detalles_pedido");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PedidoId).HasColumnName("pedido_id");
            entity.Property(e => e.ProductoId).HasColumnName("producto_id");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.PrecioUnitario).HasColumnName("precio_unitario").HasPrecision(12, 2);
            entity.Property(e => e.Subtotal).HasColumnName("subtotal").HasPrecision(12, 2);

            entity.HasOne(e => e.Producto).WithMany().HasForeignKey(e => e.ProductoId);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("pagos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PedidoId).HasColumnName("pedido_id");
            entity.Property(e => e.Monto).HasColumnName("monto").HasPrecision(12, 2);
            entity.Property(e => e.MetodoPago).HasColumnName("metodo_pago").HasMaxLength(50);
            entity.Property(e => e.ReferenciaTransaccion).HasColumnName("referencia_transaccion").HasMaxLength(100);
            entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(50);
            entity.Property(e => e.FechaPago).HasColumnName("fecha_pago");

            entity.HasOne(e => e.Pedido).WithMany().HasForeignKey(e => e.PedidoId);
        });

        modelBuilder.Entity<Shipment>(entity =>
        {
            entity.ToTable("encomiendas");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CodigoTracking).HasColumnName("codigo_tracking").IsRequired().HasMaxLength(50);
            entity.Property(e => e.PedidoId).HasColumnName("pedido_id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.SedeOrigenId).HasColumnName("sede_origen_id");
            entity.Property(e => e.SedeDestinoId).HasColumnName("sede_destino_id");
            entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(50);
            entity.Property(e => e.EmpleadoEntregaId).HasColumnName("empleado_entrega_id");
            entity.Property(e => e.FechaEntrega).HasColumnName("fecha_entrega");
            entity.Property(e => e.FechaRegistro).HasColumnName("fecha_registro");
            entity.Property(e => e.ActualizadoEn).HasColumnName("actualizado_en");

            entity.HasOne(e => e.Pedido).WithMany().HasForeignKey(e => e.PedidoId);
            entity.HasOne(e => e.Cliente).WithMany().HasForeignKey(e => e.ClienteId);
            entity.HasOne(e => e.SedeOrigen).WithMany().HasForeignKey(e => e.SedeOrigenId);
            entity.HasOne(e => e.SedeDestino).WithMany().HasForeignKey(e => e.SedeDestinoId);
            entity.HasOne(e => e.EmpleadoEntrega).WithMany().HasForeignKey(e => e.EmpleadoEntregaId);
            entity.HasMany(e => e.Historial).WithOne(h => h.Encomienda).HasForeignKey(h => h.EncomiendaId);
        });

        modelBuilder.Entity<TrackingHistory>(entity =>
        {
            entity.ToTable("historial_tracking");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EncomiendaId).HasColumnName("encomienda_id");
            entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(50);
            entity.Property(e => e.UbicacionSedeId).HasColumnName("ubicacion_sede_id");
            entity.Property(e => e.Comentario).HasColumnName("comentario");
            entity.Property(e => e.RegistradoPorId).HasColumnName("registrado_por_id");
            entity.Property(e => e.Fecha).HasColumnName("fecha");

            entity.HasOne(e => e.UbicacionSede).WithMany().HasForeignKey(e => e.UbicacionSedeId);
            entity.HasOne(e => e.RegistradoPor).WithMany().HasForeignKey(e => e.RegistradoPorId);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("logs_auditoria");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id");
            entity.Property(e => e.UsuarioEmail).HasColumnName("usuario_email").HasMaxLength(150);
            entity.Property(e => e.Accion).HasColumnName("accion").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Modulo).HasColumnName("modulo").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Detalles).HasColumnName("detalles");
            entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(50);
            entity.Property(e => e.Fecha).HasColumnName("fecha");
        });
    }
}
