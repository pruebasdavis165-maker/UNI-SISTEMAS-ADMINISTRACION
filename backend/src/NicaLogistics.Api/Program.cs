using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NicaLogistics.Api.Middlewares;
using NicaLogistics.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 1. Inyección de Dependencias de Capas Hexagonales
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Controladores
builder.Services.AddControllers();

// 3. CORS para permitir frontend Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Autenticación JWT y Roles
var jwtKey = builder.Configuration["Jwt:Key"] ?? "NicaLogisticsUltraSecureJwtSecretKey2026!EnterpriseGrade";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "NicaLogistics";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "NicaLogisticsUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Documentación Swagger / OpenAPI (Issue 6.5)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NicaLogistics API — Plataforma Enterprise Sede a Sede",
        Version = "v1",
        Description = "Documentación interactiva de la API NicaLogistics. Plataforma E-commerce y logística de ventanilla (Miami Hub ⇄ Nicaragua)."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Pipeline HTTP: Swagger activo tanto en desarrollo como en producción para verificación
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "NicaLogistics API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseStaticFiles();

// Servir volumen de subida de imágenes (Política 3, Issue 1.2, 3.1, 3.2)
var uploadsDir = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsDir))
{
    Directory.CreateDirectory(uploadsDir);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsDir),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

// Middleware de Auditoría (RF-12, Política 6, Issue 2.4)
app.UseMiddleware<AuditLoggingMiddleware>();

app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    System = "NicaLogistics API",
    Version = "1.0.0",
    Status = "Healthy",
    Architecture = "Hexagonal .NET 9",
    Mode = "Sede a Sede (Pickup en Ventanilla)",
    Documentation = "/swagger",
    Timestamp = DateTime.UtcNow
}));

app.Run();
