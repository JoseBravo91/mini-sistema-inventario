using System.Security.Claims;
using InventarioApi.Application.Dtos;
using InventarioApi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventarioApi.Api.Controllers;

[ApiController]
[Route("api/movimientos")]
[Authorize]
public class MovimientosController : ControllerBase
{
    private readonly IMovimientoService _movimientoService;

    public MovimientosController(IMovimientoService movimientoService)
    {
        _movimientoService = movimientoService;
    }

    [HttpPost("entrada")]
    public async Task<IActionResult> RegistrarEntrada([FromBody] RegistrarMovimientoDto dto)
    {
        await _movimientoService.RegistrarEntradaAsync(dto, ObtenerUsuarioId());
        return NoContent();
    }

    // La validacion de stock suficiente ocurre dentro del stored procedure sp_registrar_salida
    [HttpPost("salida")]
    public async Task<IActionResult> RegistrarSalida([FromBody] RegistrarMovimientoDto dto)
    {
        await _movimientoService.RegistrarSalidaAsync(dto, ObtenerUsuarioId());
        return NoContent();
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial([FromQuery] int pagina = 1, [FromQuery] int tamanoPagina = 10, [FromQuery] int? productoId = null)
    {
        var resultado = await _movimientoService.ObtenerHistorialAsync(pagina, tamanoPagina, productoId);
        return Ok(resultado);
    }

    private int ObtenerUsuarioId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.Parse(claim!);
    }
}
