namespace InventarioApi.Application.Common;

// Excepcion para violaciones de reglas de negocio, se traduce a HTTP 400
public class ExcepcionNegocio : Exception
{
    public ExcepcionNegocio(string mensaje) : base(mensaje)
    {
    }
}

// Excepcion para recursos no encontrados, se traduce a HTTP 404
public class ExcepcionNoEncontrado : Exception
{
    public ExcepcionNoEncontrado(string mensaje) : base(mensaje)
    {
    }
}

// Excepcion para credenciales invalidas, se traduce a HTTP 401
public class ExcepcionNoAutorizado : Exception
{
    public ExcepcionNoAutorizado(string mensaje) : base(mensaje)
    {
    }
}
