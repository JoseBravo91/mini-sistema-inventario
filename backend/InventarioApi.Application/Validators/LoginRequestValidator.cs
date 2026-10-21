using FluentValidation;
using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.NombreUsuario).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Contrasena).NotEmpty().MaximumLength(100);
    }
}
