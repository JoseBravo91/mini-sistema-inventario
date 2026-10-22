using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Interfaces;

public interface IProductoService
{
    Task<ResultadoPaginado<ProductoDto>> ListarAsync(int pagina, int tamanoPagina, string? busqueda);
    Task<ProductoDto> ObtenerPorIdAsync(int id);
    Task<ProductoDto> CrearAsync(CrearProductoDto dto, int usuarioId);
    Task<ProductoDto> ActualizarAsync(int id, ActualizarProductoDto dto, int usuarioId);
}
