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
}
