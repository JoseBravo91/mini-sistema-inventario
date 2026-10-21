using InventarioApi.Domain.Entities;

namespace InventarioApi.Application.Interfaces;

public interface IInventarioRepository
{
    // Ejecuta fn_inventario_actual en PostgreSQL
    Task<IReadOnlyList<InventarioActual>> ObtenerInventarioActualAsync();
}
