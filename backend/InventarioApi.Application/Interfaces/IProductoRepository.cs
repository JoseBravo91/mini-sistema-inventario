using InventarioApi.Domain.Entities;

namespace InventarioApi.Application.Interfaces;

public interface IProductoRepository
{
    Task<(IReadOnlyList<Producto> Items, int Total)> ObtenerPaginadoAsync(int pagina, int tamanoPagina, string? busqueda);
    Task<Producto?> ObtenerPorIdAsync(int id);
    Task<Producto?> ObtenerPorCodigoAsync(string codigo);
    Task<Producto> CrearAsync(Producto producto);
    Task ActualizarAsync(Producto producto);
}
