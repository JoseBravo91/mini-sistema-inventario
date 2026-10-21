using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace InventarioApi.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUsuarioRepository usuarioRepository, IJwtTokenGenerator jwtTokenGenerator, ILogger<AuthService> logger)
    {
        _usuarioRepository = usuarioRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _usuarioRepository.ObtenerPorNombreUsuarioAsync(request.NombreUsuario);

        // Se usa el mismo mensaje para usuario inexistente o contrasena invalida, evita enumeracion de usuarios
        if (usuario is null || !usuario.Activo || !BCrypt.Net.BCrypt.Verify(request.Contrasena, usuario.ContrasenaHash))
        {
            _logger.LogWarning("Intento de login fallido para el usuario {NombreUsuario}", request.NombreUsuario);
            throw new ExcepcionNoAutorizado("Usuario o contrasena incorrectos");
        }

        var (token, expiraEn) = _jwtTokenGenerator.GenerarToken(usuario);
        _logger.LogInformation("Login exitoso para el usuario {NombreUsuario}", request.NombreUsuario);

        return new LoginResponseDto(token, expiraEn, usuario.NombreUsuario, usuario.NombreCompleto, usuario.Rol);
    }
}
