using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Infrastructure.Data;
using NicaLogistics.Infrastructure.Security;
using NicaLogistics.Infrastructure.Services;

namespace NicaLogistics.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Port=5432;Database=nicalogistics_db;Username=nicalogistics_user;Password=NicaLogisticsSecure2026!";

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISedeService, SedeService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<INotificationService, EmailNotificationService>();
        services.AddScoped<IShipmentService, ShipmentService>();
        services.AddScoped<IPaymentGatewayService, StripePaymentGatewayService>();

        return services;
    }
}
