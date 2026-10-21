using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;
using InventarioApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace InventarioApi.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ILogger<UsuarioService> _logger;

    public UsuarioService(IUsuarioRepository usuarioRepository, ILogger<UsuarioService> logger)
    {
        _usuarioRepository = usuarioRepository;
        _logger = logger;
    }

    public async Task<ResultadoPaginado<UsuarioDto>> ListarAsync(int pagina, int tamanoPagina, string? busqueda)
    {
        var (items, total) = await _usuarioRepository.ObtenerPaginadoAsync(pagina, tamanoPagina, busqueda);

        return new ResultadoPaginado<UsuarioDto>
        {
            Items = items.Select(MapearADto).ToList(),
            Pagina = pagina,
            TamanoPagina = tamanoPagina,
            TotalRegistros = total
        };
    }

    public async Task<UsuarioDto> ObtenerPorIdAsync(int id)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id)
            ?? throw new ExcepcionNoEncontrado($"No se encontro el usuario con id {id}");

        return MapearADto(usuario);
    }

    public async Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto)
    {
        var existente = await _usuarioRepository.ObtenerPorNombreUsuarioAsync(dto.NombreUsuario);
        if (existente is not null)
        {
            throw new ExcepcionNegocio($"Ya existe un usuario con el nombre {dto.NombreUsuario}");
        }

        var usuario = new Usuario
        {
            NombreUsuario = dto.NombreUsuario,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.Contrasena),
            NombreCompleto = dto.NombreCompleto,
            Rol = "ADMIN",
            Activo = true,
            FechaCreacion = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified)
        };

        var creado = await _usuarioRepository.CrearAsync(usuario);
        _logger.LogInformation("Usuario creado: {NombreUsuario}", creado.NombreUsuario);

        return MapearADto(creado);
    }

    public async Task<UsuarioDto> ActualizarAsync(int id, ActualizarUsuarioDto dto)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id)
            ?? throw new ExcepcionNoEncontrado($"No se encontro el usuario con id {id}");

        usuario.NombreCompleto = dto.NombreCompleto;
        usuario.Activo = dto.Activo;

        if (!string.IsNullOrWhiteSpace(dto.NuevaContrasena))
        {
            usuario.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaContrasena);
        }

        await _usuarioRepository.ActualizarAsync(usuario);
        _logger.LogInformation("Usuario actualizado: {Id} - {NombreUsuario}", usuario.Id, usuario.NombreUsuario);

        return MapearADto(usuario);
    }

    private static UsuarioDto MapearADto(Usuario usuario) =>
        new(usuario.Id, usuario.NombreUsuario, usuario.NombreCompleto, usuario.Rol, usuario.Activo);
}
