using FluentValidation;
using InventarioApi.Application.Interfaces;
using InventarioApi.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InventarioApi.Application;

public static class DependencyInjection
{
    public static IServiceCollection AgregarAplicacion(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Validators.LoginRequestValidator>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductoService, ProductoService>();
        services.AddScoped<IMovimientoService, MovimientoService>();
        services.AddScoped<IInventarioService, InventarioService>();
        services.AddScoped<IUsuarioService, UsuarioService>();

        return services;
    }
}
