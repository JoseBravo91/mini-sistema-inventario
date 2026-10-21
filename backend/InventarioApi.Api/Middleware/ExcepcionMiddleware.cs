using FluentValidation;
using InventarioApi.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace InventarioApi.Api.Middleware;

// Captura todas las excepciones no manejadas y las traduce a ProblemDetails sin exponer detalles internos
public class ExcepcionMiddleware
{
    private readonly RequestDelegate _siguiente;
    private readonly ILogger<ExcepcionMiddleware> _logger;

    public ExcepcionMiddleware(RequestDelegate siguiente, ILogger<ExcepcionMiddleware> logger)
    {
        _siguiente = siguiente;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _siguiente(context);
        }
        catch (Exception ex)
        {
            await ManejarExcepcionAsync(context, ex);
        }
    }

    private async Task ManejarExcepcionAsync(HttpContext context, Exception ex)
    {
        var (codigoEstado, titulo) = ex switch
        {
            ExcepcionNoAutorizado => (StatusCodes.Status401Unauthorized, "No autorizado"),
            ExcepcionNoEncontrado => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            ExcepcionNegocio => (StatusCodes.Status400BadRequest, "Solicitud invalida"),
            ValidationException => (StatusCodes.Status400BadRequest, "Error de validacion"),
            _ => (StatusCodes.Status500InternalServerError, "Error interno del servidor")
        };

        if (codigoEstado == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(ex, "Error no controlado procesando {Metodo} {Ruta}", context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogWarning("Error de negocio: {Mensaje} en {Metodo} {Ruta}", ex.Message, context.Request.Method, context.Request.Path);
        }

        var detalle = ex switch
        {
            ValidationException validacion => string.Join("; ", validacion.Errors.Select(e => e.ErrorMessage)),
            _ when codigoEstado == StatusCodes.Status500InternalServerError => "Ocurrio un error inesperado, intente nuevamente",
            _ => ex.Message
        };

        var problema = new ProblemDetails
        {
            Status = codigoEstado,
            Title = titulo,
            Detail = detalle
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = codigoEstado;
        await context.Response.WriteAsJsonAsync(problema);
    }
}
