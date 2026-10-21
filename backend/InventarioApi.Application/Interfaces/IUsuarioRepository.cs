using InventarioApi.Domain.Entities;

namespace InventarioApi.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario);
}
