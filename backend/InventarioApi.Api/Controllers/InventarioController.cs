using InventarioApi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventarioApi.Api.Controllers;

[ApiController]
[Route("api/inventario")]
[Authorize]
public class InventarioController : ControllerBase
{
    private readonly IInventarioService _inventarioService;

    public InventarioController(IInventarioService inventarioService)
    {
        _inventarioService = inventarioService;
    }

    // Estado actual de inventario por producto, calculado via fn_inventario_actual
    [HttpGet]
    public async Task<IActionResult> ObtenerInventarioActual()
    {
        var inventario = await _inventarioService.ObtenerInventarioActualAsync();
        return Ok(inventario);
    }
}
