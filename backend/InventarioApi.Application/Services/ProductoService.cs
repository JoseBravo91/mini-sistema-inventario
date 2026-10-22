using InventarioApi.Application.Common;
using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;
using InventarioApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace InventarioApi.Application.Services;

public class ProductoService : IProductoService
{
    private readonly IProductoRepository _productoRepository;
    private readonly ILogger<ProductoService> _logger;

    public ProductoService(IProductoRepository productoRepository, ILogger<ProductoService> logger)
    {
        _productoRepository = productoRepository;
        _logger = logger;
    }

    public async Task<ResultadoPaginado<ProductoDto>> ListarAsync(int pagina, int tamanoPagina, string? busqueda)
    {
        var (items, total) = await _productoRepository.ObtenerPaginadoAsync(pagina, tamanoPagina, busqueda);

        return new ResultadoPaginado<ProductoDto>
        {
            Items = items.Select(MapearADto).ToList(),
            Pagina = pagina,
            TamanoPagina = tamanoPagina,
            TotalRegistros = total
        };
    }

    public async Task<ProductoDto> ObtenerPorIdAsync(int id)
    {
        var producto = await _productoRepository.ObtenerPorIdAsync(id)
            ?? throw new ExcepcionNoEncontrado($"No se encontro el producto con id {id}");

        return MapearADto(producto);
    }

    public async Task<ProductoDto> CrearAsync(CrearProductoDto dto, int usuarioId)
    {
        var existente = await _productoRepository.ObtenerPorCodigoAsync(dto.Codigo);
        if (existente is not null)
        {
            throw new ExcepcionNegocio($"Ya existe un producto con el codigo {dto.Codigo}");
        }

        var producto = new Producto
        {
            Codigo = dto.Codigo,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Precio = dto.Precio,
            StockMinimo = dto.StockMinimo,
            Activo = true,
            FechaCreacion = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreadoPor = usuarioId
        };

        var creado = await _productoRepository.CrearAsync(producto);
        _logger.LogInformation("Producto creado: {Codigo} - {Nombre} por usuario {UsuarioId}", creado.Codigo, creado.Nombre, usuarioId);

        // Se vuelve a leer para traer el nombre del usuario creador ya resuelto via Include
        var recargado = await _productoRepository.ObtenerPorIdAsync(creado.Id) ?? creado;
        return MapearADto(recargado);
    }

    public async Task<ProductoDto> ActualizarAsync(int id, ActualizarProductoDto dto, int usuarioId)
    {
        var producto = await _productoRepository.ObtenerPorIdAsync(id)
            ?? throw new ExcepcionNoEncontrado($"No se encontro el producto con id {id}");

        producto.Nombre = dto.Nombre;
        producto.Descripcion = dto.Descripcion;
        producto.Precio = dto.Precio;
        producto.StockMinimo = dto.StockMinimo;
        producto.Activo = dto.Activo;
        producto.FechaActualizacion = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        producto.ActualizadoPor = usuarioId;

        await _productoRepository.ActualizarAsync(producto);
        _logger.LogInformation("Producto actualizado: {Id} - {Nombre} por usuario {UsuarioId}", producto.Id, producto.Nombre, usuarioId);

        var recargado = await _productoRepository.ObtenerPorIdAsync(id) ?? producto;
        return MapearADto(recargado);
    }

    private static ProductoDto MapearADto(Producto producto) => new(
        producto.Id,
        producto.Codigo,
        producto.Nombre,
        producto.Descripcion,
        producto.Precio,
        producto.StockMinimo,
        producto.Activo,
        producto.FechaCreacion,
        producto.FechaActualizacion,
        producto.UsuarioCreador?.NombreCompleto,
        producto.UsuarioActualizador?.NombreCompleto
    );
}
