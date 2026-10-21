using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;

namespace InventarioApi.Api.Middleware;

// Valida con FluentValidation cada argumento de la accion que tenga un validador registrado
public class ValidacionAutomaticaFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public ValidacionAutomaticaFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argumento in context.ActionArguments.Values)
        {
            if (argumento is null)
            {
                continue;
            }

            var tipoValidador = typeof(IValidator<>).MakeGenericType(argumento.GetType());
            if (_serviceProvider.GetService(tipoValidador) is IValidator validador)
            {
                var resultado = await validador.ValidateAsync(new FluentValidation.ValidationContext<object>(argumento));
                if (!resultado.IsValid)
                {
                    throw new FluentValidation.ValidationException(resultado.Errors);
                }
            }
        }

        await next();
    }
}
