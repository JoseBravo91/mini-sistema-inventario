using InventarioApi.Application.Interfaces;
using InventarioApi.Domain.Entities;
using InventarioApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventarioApi.Infrastructure.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly InventarioDbContext _context;

    public ProductoRepository(InventarioDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<Producto> Items, int Total)> ObtenerPaginadoAsync(int pagina, int tamanoPagina, string? busqueda)
    {
        var query = _context.Productos
            .AsNoTracking()
            .Include(p => p.UsuarioCreador)
            .Include(p => p.UsuarioActualizador)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var texto = busqueda.Trim().ToLower();
            query = query.Where(p => p.Nombre.ToLower().Contains(texto) || p.Codigo.ToLower().Contains(texto));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Nombre)
            .Skip((pagina - 1) * tamanoPagina)
            .Take(tamanoPagina)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Producto?> ObtenerPorIdAsync(int id)
    {
        return await _context.Productos
            .Include(p => p.UsuarioCreador)
            .Include(p => p.UsuarioActualizador)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Producto?> ObtenerPorCodigoAsync(string codigo)
    {
        return await _context.Productos.AsNoTracking().FirstOrDefaultAsync(p => p.Codigo == codigo);
    }

    public async Task<Producto> CrearAsync(Producto producto)
    {
        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();
        return producto;
    }

    public async Task ActualizarAsync(Producto producto)
    {
        _context.Productos.Update(producto);
        await _context.SaveChangesAsync();
    }
}
