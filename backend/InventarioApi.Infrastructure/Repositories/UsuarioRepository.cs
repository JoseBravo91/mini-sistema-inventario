using InventarioApi.Application.Interfaces;
using InventarioApi.Domain.Entities;
using InventarioApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InventarioApi.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly InventarioDbContext _context;

    public UsuarioRepository(InventarioDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.NombreUsuario == nombreUsuario);
    }

    public async Task<(IReadOnlyList<Usuario> Items, int Total)> ObtenerPaginadoAsync(int pagina, int tamanoPagina, string? busqueda)
    {
        var query = _context.Usuarios.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var texto = busqueda.Trim().ToLower();
            query = query.Where(u => u.NombreUsuario.ToLower().Contains(texto) || u.NombreCompleto.ToLower().Contains(texto));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(u => u.NombreCompleto)
            .Skip((pagina - 1) * tamanoPagina)
            .Take(tamanoPagina)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Usuario?> ObtenerPorIdAsync(int id)
    {
        return await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Usuario> CrearAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task ActualizarAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }
}
