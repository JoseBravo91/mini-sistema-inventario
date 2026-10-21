using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Interfaces;

public interface IMovimientoService
{
    Task RegistrarEntradaAsync(RegistrarMovimientoDto dto, int usuarioId);
    Task RegistrarSalidaAsync(RegistrarMovimientoDto dto, int usuarioId);
    Task<ResultadoPaginado<MovimientoDto>> ObtenerHistorialAsync(int pagina, int tamanoPagina, int? productoId);
}
