namespace InventarioApi.Domain.Entities;

// Producto administrado en el inventario
public class Producto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int StockMinimo { get; set; }
    public bool Activo { get; set; } = true;
    public string? ImagenUrl { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int? CreadoPor { get; set; }
    public int? ActualizadoPor { get; set; }

    public Usuario? UsuarioCreador { get; set; }
    public Usuario? UsuarioActualizador { get; set; }
}
