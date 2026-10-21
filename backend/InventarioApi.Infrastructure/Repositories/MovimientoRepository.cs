using InventarioApi.Application.Common;
using InventarioApi.Application.Interfaces;
using InventarioApi.Domain.Entities;
using InventarioApi.Domain.Enums;
using InventarioApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace InventarioApi.Infrastructure.Repositories;

public class MovimientoRepository : IMovimientoRepository
{
    private readonly InventarioDbContext _context;

    public MovimientoRepository(InventarioDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarEntradaAsync(int productoId, int cantidad, int usuarioId, string? observacion)
    {
        await EjecutarProcedimientoAsync("CALL sp_registrar_entrada(@producto_id, @cantidad, @usuario_id, @observacion)",
            productoId, cantidad, usuarioId, observacion);
    }

    public async Task RegistrarSalidaAsync(int productoId, int cantidad, int usuarioId, string? observacion)
    {
        await EjecutarProcedimientoAsync("CALL sp_registrar_salida(@producto_id, @cantidad, @usuario_id, @observacion)",
            productoId, cantidad, usuarioId, observacion);
    }

    private async Task EjecutarProcedimientoAsync(string sql, int productoId, int cantidad, int usuarioId, string? observacion)
    {
        var conexion = (NpgsqlConnection)_context.Database.GetDbConnection();
        var abrioLaConexion = await AbrirSiEsNecesarioAsync(conexion);

        try
        {
            await using var comando = new NpgsqlCommand(sql, conexion);
            comando.Parameters.AddWithValue("producto_id", productoId);
            comando.Parameters.AddWithValue("cantidad", cantidad);
            comando.Parameters.AddWithValue("usuario_id", usuarioId);
            comando.Parameters.AddWithValue("observacion", (object?)observacion ?? DBNull.Value);

            await comando.ExecuteNonQueryAsync();
        }
        catch (PostgresException ex) when (ex.SqlState == "P0001")
        {
            // Las excepciones de negocio lanzadas con RAISE EXCEPTION llegan aqui (ej. stock insuficiente)
            throw new ExcepcionNegocio(ex.MessageText);
        }
        finally
        {
            if (abrioLaConexion)
            {
                await conexion.CloseAsync();
            }
        }
    }

    public async Task<(IReadOnlyList<Movimiento> Items, int Total)> ObtenerHistorialAsync(int pagina, int tamanoPagina, int? productoId)
    {
        var conexion = (NpgsqlConnection)_context.Database.GetDbConnection();
        var abrioLaConexion = await AbrirSiEsNecesarioAsync(conexion);

        try
        {
            var filtro = productoId.HasValue ? "WHERE m.producto_id = @producto_id" : "";
            var sql = $@"
                SELECT m.id, m.producto_id, p.nombre AS producto_nombre, m.tipo::text AS tipo,
                       m.cantidad, m.fecha, u.nombre_completo AS usuario_nombre, m.observacion,
                       COUNT(*) OVER() AS total
                FROM movimientos m
                JOIN productos p ON p.id = m.producto_id
                JOIN usuarios u ON u.id = m.usuario_id
                {filtro}
                ORDER BY m.fecha DESC
                LIMIT @tamano_pagina OFFSET @offset";

            await using var comando = new NpgsqlCommand(sql, conexion);
            comando.Parameters.AddWithValue("tamano_pagina", tamanoPagina);
            comando.Parameters.AddWithValue("offset", (pagina - 1) * tamanoPagina);
            if (productoId.HasValue)
            {
                comando.Parameters.AddWithValue("producto_id", productoId.Value);
            }

            var items = new List<Movimiento>();
            var total = 0;

            await using var lector = await comando.ExecuteReaderAsync();
            while (await lector.ReadAsync())
            {
                total = lector.GetInt32(lector.GetOrdinal("total"));
                items.Add(new Movimiento
                {
                    Id = lector.GetInt32(lector.GetOrdinal("id")),
                    ProductoId = lector.GetInt32(lector.GetOrdinal("producto_id")),
                    Producto = new Producto { Nombre = lector.GetString(lector.GetOrdinal("producto_nombre")) },
                    Tipo = lector.GetString(lector.GetOrdinal("tipo")) == "ENTRADA" ? TipoMovimiento.Entrada : TipoMovimiento.Salida,
                    Cantidad = lector.GetInt32(lector.GetOrdinal("cantidad")),
                    Fecha = lector.GetDateTime(lector.GetOrdinal("fecha")),
                    Usuario = new Usuario { NombreCompleto = lector.GetString(lector.GetOrdinal("usuario_nombre")) },
                    Observacion = lector.IsDBNull(lector.GetOrdinal("observacion")) ? null : lector.GetString(lector.GetOrdinal("observacion"))
                });
            }

            return (items, total);
        }
        finally
        {
            if (abrioLaConexion)
            {
                await conexion.CloseAsync();
            }
        }
    }

    private static async Task<bool> AbrirSiEsNecesarioAsync(NpgsqlConnection conexion)
    {
        if (conexion.State == System.Data.ConnectionState.Open)
        {
            return false;
        }

        await conexion.OpenAsync();
        return true;
    }
}
