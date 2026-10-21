namespace InventarioApi.Application.Dtos;

// Datos de entrada para el login
public record LoginRequestDto(string NombreUsuario, string Contrasena);

// Respuesta del login con el token y datos basicos del usuario
public record LoginResponseDto(string Token, DateTime ExpiraEn, string NombreUsuario, string NombreCompleto, string Rol);
