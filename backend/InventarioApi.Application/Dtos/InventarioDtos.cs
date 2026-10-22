namespace InventarioApi.Application.Dtos;

// Representacion del estado actual de inventario por producto
public record InventarioActualDto(int ProductoId, string Codigo, string Nombre, decimal Precio, int StockMinimo, string? ImagenUrl, long StockActual, string Estado);
