namespace InventarioApi.Application.Dtos;

// Representacion de usuario para lectura, nunca incluye la contrasena
public record UsuarioDto(int Id, string NombreUsuario, string NombreCompleto, string Rol, bool Activo);

// Datos de entrada para crear un usuario, siempre se crea con rol ADMIN
public record CrearUsuarioDto(string NombreUsuario, string Contrasena, string NombreCompleto);

// Datos de entrada para actualizar un usuario existente, la contrasena es opcional
public record ActualizarUsuarioDto(string NombreCompleto, bool Activo, string? NuevaContrasena);
