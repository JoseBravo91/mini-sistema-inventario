using InventarioApi.Application.Dtos;

namespace InventarioApi.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
}
