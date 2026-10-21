using InventarioApi.Domain.Entities;

namespace InventarioApi.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario);
    Task<(IReadOnlyList<Usuario> Items, int Total)> ObtenerPaginadoAsync(int pagina, int tamanoPagina, string? busqueda);
    Task<Usuario?> ObtenerPorIdAsync(int id);
    Task<Usuario> CrearAsync(Usuario usuario);
    Task ActualizarAsync(Usuario usuario);
}
