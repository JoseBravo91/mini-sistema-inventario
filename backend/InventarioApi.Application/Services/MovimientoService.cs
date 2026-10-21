using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace InventarioApi.Application.Services;

public class MovimientoService : IMovimientoService
{
    private readonly IMovimientoRepository _movimientoRepository;
    private readonly IProductoRepository _productoRepository;
    private readonly ILogger<MovimientoService> _logger;

    public MovimientoService(IMovimientoRepository movimientoRepository, IProductoRepository productoRepository, ILogger<MovimientoService> logger)
    {
        _movimientoRepository = movimientoRepository;
        _productoRepository = productoRepository;
        _logger = logger;
    }

    public async Task RegistrarEntradaAsync(RegistrarMovimientoDto dto, int usuarioId)
    {
        await ValidarProductoActivoAsync(dto.ProductoId);

        await _movimientoRepository.RegistrarEntradaAsync(dto.ProductoId, dto.Cantidad, usuarioId, dto.Observacion);
        _logger.LogInformation("Entrada registrada: producto {ProductoId}, cantidad {Cantidad}, usuario {UsuarioId}", dto.ProductoId, dto.Cantidad, usuarioId);
    }

    public async Task RegistrarSalidaAsync(RegistrarMovimientoDto dto, int usuarioId)
    {
        await ValidarProductoActivoAsync(dto.ProductoId);

        // La validacion de stock suficiente ocurre dentro de sp_registrar_salida
        await _movimientoRepository.RegistrarSalidaAsync(dto.ProductoId, dto.Cantidad, usuarioId, dto.Observacion);
        _logger.LogInformation("Salida registrada: producto {ProductoId}, cantidad {Cantidad}, usuario {UsuarioId}", dto.ProductoId, dto.Cantidad, usuarioId);
    }

    public async Task<ResultadoPaginado<MovimientoDto>> ObtenerHistorialAsync(int pagina, int tamanoPagina, int? productoId)
    {
        var (items, total) = await _movimientoRepository.ObtenerHistorialAsync(pagina, tamanoPagina, productoId);

        var dtos = items.Select(m => new MovimientoDto(
            m.Id,
            m.ProductoId,
            m.Producto?.Nombre ?? string.Empty,
            m.Tipo.ToString().ToUpperInvariant(),
            m.Cantidad,
            m.Fecha,
            m.Usuario?.NombreCompleto ?? string.Empty,
            m.Observacion
        )).ToList();

        return new ResultadoPaginado<MovimientoDto>
        {
            Items = dtos,
            Pagina = pagina,
            TamanoPagina = tamanoPagina,
            TotalRegistros = total
        };
    }

    private async Task ValidarProductoActivoAsync(int productoId)
    {
        var producto = await _productoRepository.ObtenerPorIdAsync(productoId);
        if (producto is null || !producto.Activo)
        {
            throw new ExcepcionNoEncontrado($"No se encontro el producto con id {productoId} o no esta activo");
        }
    }
}
