using InventarioApi.Domain.Enums;

namespace InventarioApi.Domain.Entities;

// Movimiento de inventario, registrado siempre via stored procedure
public class Movimiento
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public TipoMovimiento Tipo { get; set; }
    public int Cantidad { get; set; }
    public DateTime Fecha { get; set; }
    public int UsuarioId { get; set; }
    public string? Observacion { get; set; }

    public Producto? Producto { get; set; }
    public Usuario? Usuario { get; set; }
}
