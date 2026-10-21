using FluentValidation;
using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Validators;

public class RegistrarMovimientoValidator : AbstractValidator<RegistrarMovimientoDto>
{
    public RegistrarMovimientoValidator()
    {
        RuleFor(x => x.ProductoId).GreaterThan(0);
        RuleFor(x => x.Cantidad).GreaterThan(0).WithMessage("La cantidad debe ser mayor a cero");
        RuleFor(x => x.Observacion).MaximumLength(500);
    }
}
