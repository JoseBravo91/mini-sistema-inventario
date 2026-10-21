using InventarioApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventarioApi.Infrastructure.Persistence;

// Los movimientos e inventario no se mapean aqui: se ejecutan via ADO.NET directo a los stored procedures
public class InventarioDbContext : DbContext
{
    public InventarioDbContext(DbContextOptions<InventarioDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Producto> Productos => Set<Producto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(entidad =>
        {
            entidad.ToTable("usuarios");
            entidad.HasKey(u => u.Id);
            entidad.Property(u => u.Id).HasColumnName("id");
            entidad.Property(u => u.NombreUsuario).HasColumnName("nombre_usuario");
            entidad.Property(u => u.ContrasenaHash).HasColumnName("contrasena_hash");
            entidad.Property(u => u.NombreCompleto).HasColumnName("nombre_completo");
            entidad.Property(u => u.Rol).HasColumnName("rol");
            entidad.Property(u => u.Activo).HasColumnName("activo");
            entidad.Property(u => u.FechaCreacion).HasColumnName("fecha_creacion");
        });

        modelBuilder.Entity<Producto>(entidad =>
        {
            entidad.ToTable("productos");
            entidad.HasKey(p => p.Id);
            entidad.Property(p => p.Id).HasColumnName("id");
            entidad.Property(p => p.Codigo).HasColumnName("codigo");
            entidad.Property(p => p.Nombre).HasColumnName("nombre");
            entidad.Property(p => p.Descripcion).HasColumnName("descripcion");
            entidad.Property(p => p.Precio).HasColumnName("precio");
            entidad.Property(p => p.StockMinimo).HasColumnName("stock_minimo");
            entidad.Property(p => p.Activo).HasColumnName("activo");
            entidad.Property(p => p.FechaCreacion).HasColumnName("fecha_creacion");
        });
    }
}
