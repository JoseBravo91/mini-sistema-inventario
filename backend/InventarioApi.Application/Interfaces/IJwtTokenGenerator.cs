using InventarioApi.Domain.Entities;

namespace InventarioApi.Application.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiraEn) GenerarToken(Usuario usuario);
}
