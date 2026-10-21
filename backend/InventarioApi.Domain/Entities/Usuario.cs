namespace InventarioApi.Domain.Entities;

// Usuario del sistema, usado para autenticacion y auditoria de movimientos
public class Usuario
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string ContrasenaHash { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Rol { get; set; } = "OPERADOR";
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; }
}
