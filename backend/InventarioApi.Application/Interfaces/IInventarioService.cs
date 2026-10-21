using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Interfaces;

public interface IInventarioService
{
    Task<IReadOnlyList<InventarioActualDto>> ObtenerInventarioActualAsync();
}
