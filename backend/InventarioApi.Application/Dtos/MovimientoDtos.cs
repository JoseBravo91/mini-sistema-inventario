namespace InventarioApi.Application.Dtos;

// Datos de entrada para registrar una entrada o salida de inventario
public record RegistrarMovimientoDto(int ProductoId, int Cantidad, string? Observacion);

// Representacion de un movimiento para el historial
public record MovimientoDto(int Id, int ProductoId, string ProductoNombre, string Tipo, int Cantidad, DateTime Fecha, string Usuario, string? Observacion);
