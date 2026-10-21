namespace InventarioApi.Infrastructure.Security;

// Configuracion del token JWT, se lee desde user-secrets o variables de entorno
public class JwtSettings
{
    public string Clave { get; set; } = string.Empty;
    public string Emisor { get; set; } = string.Empty;
    public string Audiencia { get; set; } = string.Empty;
    public int MinutosExpiracion { get; set; } = 60;
}
