using FluentValidation;
using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Validators;

public class CrearUsuarioValidator : AbstractValidator<CrearUsuarioDto>
{
    public CrearUsuarioValidator()
    {
        RuleFor(x => x.NombreUsuario).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Contrasena).NotEmpty().MinimumLength(8).MaximumLength(100);
        RuleFor(x => x.NombreCompleto).NotEmpty().MaximumLength(150);
    }
}

public class ActualizarUsuarioValidator : AbstractValidator<ActualizarUsuarioDto>
{
    public ActualizarUsuarioValidator()
    {
        RuleFor(x => x.NombreCompleto).NotEmpty().MaximumLength(150);
        RuleFor(x => x.NuevaContrasena).MinimumLength(8).MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.NuevaContrasena));
    }
}
