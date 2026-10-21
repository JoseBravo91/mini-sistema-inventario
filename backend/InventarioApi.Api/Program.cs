using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using InventarioApi.Api.Middleware;
using InventarioApi.Application;
using InventarioApi.Infrastructure;
using InventarioApi.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Logging estructurado a consola y archivo con rotacion diaria
builder.Host.UseSerilog((contexto, loggerConfig) =>
{
    loggerConfig
        .ReadFrom.Configuration(contexto.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/inventario-.log", rollingInterval: RollingInterval.Day);
});

builder.Services.AddControllers(opciones =>
{
    opciones.Filters.Add<ValidacionAutomaticaFilter>();
});

builder.Services.AgregarAplicacion();
builder.Services.AgregarInfraestructura(builder.Configuration);

// Swagger con soporte para autenticacion Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opciones =>
{
    opciones.SwaggerDoc("v1", new OpenApiInfo { Title = "Inventario API", Version = "v1" });

    opciones.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese el token con el formato: Bearer {token}"
    });

    opciones.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Autenticacion JWT, la clave de firma se lee de configuracion/user-secrets, nunca del codigo
var jwtSettings = builder.Configuration.GetSection("Jwt");
var claveJwt = jwtSettings["Clave"] ?? throw new InvalidOperationException("No se configuro la clave JWT (Jwt:Clave)");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Emisor"],
            ValidAudience = jwtSettings["Audiencia"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveJwt)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

// CORS restringido unicamente al origen del frontend Angular
var frontendOrigin = builder.Configuration["Cors:FrontendOrigin"] ?? "http://localhost:4200";
builder.Services.AddCors(opciones =>
{
    opciones.AddPolicy("FrontendPolicy", politica =>
    {
        politica.WithOrigins(frontendOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Rate limiting especifico para el endpoint de login, mitiga fuerza bruta
builder.Services.AddRateLimiter(opciones =>
{
    opciones.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    opciones.AddFixedWindowLimiter("login", politica =>
    {
        politica.PermitLimit = 5;
        politica.Window = TimeSpan.FromMinutes(1);
        politica.QueueLimit = 0;
    });
});

builder.Services.AddHsts(opciones =>
{
    opciones.Preload = true;
    opciones.IncludeSubDomains = true;
    opciones.MaxAge = TimeSpan.FromDays(365);
});

var app = builder.Build();

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExcepcionMiddleware>();

app.UseHsts();
app.UseHttpsRedirection();

// Headers de seguridad adicionales
app.Use(async (context, siguiente) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    await siguiente();
});

app.UseCors("FrontendPolicy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
