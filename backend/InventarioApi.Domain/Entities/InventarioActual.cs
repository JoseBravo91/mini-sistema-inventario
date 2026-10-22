namespace InventarioApi.Domain.Entities;

// Resultado de la funcion fn_inventario_actual, sin tabla propia en EF
public class InventarioActual
{
    public int ProductoId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int StockMinimo { get; set; }
    public string? ImagenUrl { get; set; }
    public long StockActual { get; set; }
    public string Estado { get; set; } = string.Empty;
}
