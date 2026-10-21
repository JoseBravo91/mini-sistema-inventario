namespace InventarioApi.Application.Dtos;

// Representacion de producto para lectura
public record ProductoDto(int Id, string Codigo, string Nombre, string? Descripcion, decimal Precio, int StockMinimo, bool Activo);

// Datos de entrada para crear un producto
public record CrearProductoDto(string Codigo, string Nombre, string? Descripcion, decimal Precio, int StockMinimo);

// Datos de entrada para actualizar un producto existente
public record ActualizarProductoDto(string Nombre, string? Descripcion, decimal Precio, int StockMinimo, bool Activo);
