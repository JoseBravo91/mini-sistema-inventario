using InventarioApi.Application.Interfaces;
using InventarioApi.Infrastructure.Persistence;
using InventarioApi.Infrastructure.Repositories;
using InventarioApi.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InventarioApi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AgregarInfraestructura(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("InventarioDb")
            ?? throw new InvalidOperationException("No se configuro la cadena de conexion InventarioDb");

        services.AddDbContext<InventarioDbContext>(options => options.UseNpgsql(connectionString));

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IProductoRepository, ProductoRepository>();
        services.AddScoped<IMovimientoRepository, MovimientoRepository>();
        services.AddScoped<IInventarioRepository, InventarioRepository>();

        return services;
    }
}
