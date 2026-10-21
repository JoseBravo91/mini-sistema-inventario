using InventarioApi.Domain.Entities;

namespace InventarioApi.Application.Interfaces;

public interface IMovimientoRepository
{
    // Ejecuta sp_registrar_entrada en PostgreSQL
    Task RegistrarEntradaAsync(int productoId, int cantidad, int usuarioId, string? observacion);

    // Ejecuta sp_registrar_salida en PostgreSQL, valida stock dentro del procedimiento
    Task RegistrarSalidaAsync(int productoId, int cantidad, int usuarioId, string? observacion);

    Task<(IReadOnlyList<Movimiento> Items, int Total)> ObtenerHistorialAsync(int pagina, int tamanoPagina, int? productoId);
}
