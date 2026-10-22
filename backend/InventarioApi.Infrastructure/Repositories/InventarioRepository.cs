using InventarioApi.Application.Interfaces;
using InventarioApi.Domain.Entities;
using InventarioApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace InventarioApi.Infrastructure.Repositories;

public class InventarioRepository : IInventarioRepository
{
    private readonly InventarioDbContext _context;

    public InventarioRepository(InventarioDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<InventarioActual>> ObtenerInventarioActualAsync()
    {
        var conexion = (NpgsqlConnection)_context.Database.GetDbConnection();
        var abrioLaConexion = false;

        if (conexion.State != System.Data.ConnectionState.Open)
        {
            await conexion.OpenAsync();
            abrioLaConexion = true;
        }

        try
        {
            await using var comando = new NpgsqlCommand("SELECT * FROM fn_inventario_actual()", conexion);
            await using var lector = await comando.ExecuteReaderAsync();

            var resultado = new List<InventarioActual>();
            while (await lector.ReadAsync())
            {
                resultado.Add(new InventarioActual
                {
                    ProductoId = lector.GetInt32(lector.GetOrdinal("producto_id")),
                    Codigo = lector.GetString(lector.GetOrdinal("codigo")),
                    Nombre = lector.GetString(lector.GetOrdinal("nombre")),
                    Precio = lector.GetDecimal(lector.GetOrdinal("precio")),
                    StockMinimo = lector.GetInt32(lector.GetOrdinal("stock_minimo")),
                    ImagenUrl = lector.IsDBNull(lector.GetOrdinal("imagen_url")) ? null : lector.GetString(lector.GetOrdinal("imagen_url")),
                    StockActual = lector.GetInt64(lector.GetOrdinal("stock_actual")),
                    Estado = lector.GetString(lector.GetOrdinal("estado"))
                });
            }

            return resultado;
        }
        finally
        {
            if (abrioLaConexion)
            {
                await conexion.CloseAsync();
            }
        }
    }
}
