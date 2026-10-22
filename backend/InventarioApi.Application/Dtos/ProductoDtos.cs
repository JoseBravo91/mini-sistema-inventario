namespace InventarioApi.Application.Dtos;

// Representacion de producto para lectura, incluye trazabilidad de creacion y edicion
public record ProductoDto(
    int Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int StockMinimo,
    bool Activo,
    string? ImagenUrl,
    DateTime FechaCreacion,
    DateTime? FechaActualizacion,
    string? CreadoPorNombre,
    string? ActualizadoPorNombre
);

// Datos de entrada para crear un producto. ImagenUrl ya viene subida a Cloudinary desde el frontend
public record CrearProductoDto(string Codigo, string Nombre, string? Descripcion, decimal Precio, int StockMinimo, string? ImagenUrl);

// Datos de entrada para actualizar un producto existente
public record ActualizarProductoDto(string Nombre, string? Descripcion, decimal Precio, int StockMinimo, bool Activo, string? ImagenUrl);
