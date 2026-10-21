using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Interfaces;

public interface IUsuarioService
{
    Task<ResultadoPaginado<UsuarioDto>> ListarAsync(int pagina, int tamanoPagina, string? busqueda);
    Task<UsuarioDto> ObtenerPorIdAsync(int id);
    Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto);
    Task<UsuarioDto> ActualizarAsync(int id, ActualizarUsuarioDto dto);
}
