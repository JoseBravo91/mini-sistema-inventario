using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;

namespace InventarioApi.Application.Services;

public class InventarioService : IInventarioService
{
    private readonly IInventarioRepository _inventarioRepository;

    public InventarioService(IInventarioRepository inventarioRepository)
    {
        _inventarioRepository = inventarioRepository;
    }

    public async Task<IReadOnlyList<InventarioActualDto>> ObtenerInventarioActualAsync()
    {
        var inventario = await _inventarioRepository.ObtenerInventarioActualAsync();

        return inventario.Select(i => new InventarioActualDto(
            i.ProductoId, i.Codigo, i.Nombre, i.Precio, i.StockMinimo, i.ImagenUrl, i.StockActual, i.Estado
        )).ToList();
    }
}
