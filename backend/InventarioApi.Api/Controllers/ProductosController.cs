using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventarioApi.Api.Controllers;

[ApiController]
[Route("api/productos")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;

    public ProductosController(IProductoService productoService)
    {
        _productoService = productoService;
    }

    // Listado paginado de productos, permite busqueda por nombre o codigo
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int pagina = 1, [FromQuery] int tamanoPagina = 10, [FromQuery] string? busqueda = null)
    {
        var resultado = await _productoService.ListarAsync(pagina, tamanoPagina, busqueda);
        return Ok(resultado);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var producto = await _productoService.ObtenerPorIdAsync(id);
        return Ok(producto);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearProductoDto dto)
    {
        var creado = await _productoService.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarProductoDto dto)
    {
        var actualizado = await _productoService.ActualizarAsync(id, dto);
        return Ok(actualizado);
    }
}
