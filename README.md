# MiniSistema de Gestion de Inventario

Prueba tecnica: backend en C# (.NET 8) + PostgreSQL, frontend en Angular (standalone components).

## Estructura

```
/backend   API REST en .NET 8, arquitectura por capas
  InventarioApi.Domain          Entidades y enums, sin dependencias externas
  InventarioApi.Application     DTOs, interfaces, servicios, validadores (FluentValidation)
  InventarioApi.Infrastructure  EF Core + Npgsql, repositorios, JWT, acceso a stored procedures
  InventarioApi.Api             Controllers, middleware, Program.cs (seguridad, Swagger, Serilog)
/frontend  Angular standalone, Material + ag-Grid
  core/       servicios, interceptores, guards y modelos compartidos
  features/   login, inventario, productos, movimientos, usuarios
  shared/     layout principal (sidebar + toolbar)
/database  schema.sql: tablas, stored procedures, funcion y datos semilla
```

## Funcionalidades

- **Autenticacion**: login con JWT, rate limiting en el endpoint de login, guard de rutas e
  interceptores en el frontend (adjuntan el token, redirigen al expirar).
- **Productos**: CRUD con paginacion y busqueda; desactivar en vez de borrar.
- **Movimientos**: registrar entradas/salidas (la salida valida stock suficiente dentro del
  stored procedure); historial con tabla filtrable y un modal de detalle que muestra el
  movimiento completo mas la linea de tiempo de **todos** los movimientos historicos de ese
  producto.
- **Inventario actual**: estado por producto (Normal / Bajo / Agotado) calculado en PostgreSQL
  via `fn_inventario_actual()`.
- **Usuarios**: CRUD de usuarios del sistema. Un unico rol, `ADMIN`, con acceso total; la
  contrasena es obligatoria al crear y opcional al editar (dejarla vacia conserva la actual).
- **UI**: tablas con ag-Grid Community (paginacion, filtros por columna, orden, busqueda
  global), sidebar colapsable con preferencia persistida, paleta corporativa navy + azul,
  tipografia Inter, iconos Material Symbols Outlined.

## Requisitos

- .NET SDK 8
- Node.js 20+ y npm
- PostgreSQL 15+
- Angular CLI (`npx` es suficiente, no hace falta instalarlo global)

## 1. Base de datos

Con PostgreSQL corriendo localmente:

```bash
psql -U <tu_usuario> -d postgres -f database/schema.sql
```

El script crea la base `inventario_db` (la elimina si ya existe), las tablas, el tipo
`tipo_movimiento`, la funcion `fn_inventario_actual()`, los procedimientos
`sp_registrar_entrada` y `sp_registrar_salida`, y carga datos semilla:

- Usuario admin: `admin` / `Admin123!`
- 6 productos de ejemplo con movimientos iniciales

## 2. Backend

Configurar la cadena de conexion y la clave JWT con user-secrets (nunca van en el codigo):

```bash
cd backend/InventarioApi.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:InventarioDb" "Host=localhost;Port=5432;Database=inventario_db;Username=<tu_usuario>"
dotnet user-secrets set "Jwt:Clave" "$(openssl rand -base64 48)"
```

Ejecutar:

```bash
dotnet run --urls "http://localhost:5080"
```

Swagger disponible en `http://localhost:5080/swagger` (incluye boton "Authorize" para
el Bearer token).

### Seguridad implementada

- JWT firmado con clave desde user-secrets, nunca en el codigo ni en `appsettings.json`.
- Contrasenas con hash BCrypt (`BCrypt.Net-Next`).
- Rate limiting (ventana fija, 5 intentos/minuto) en `POST /api/auth/login`.
- CORS restringido al origen del frontend (`Cors:FrontendOrigin` en `appsettings.json`).
- HSTS + redireccion HTTPS + headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`).
- Validacion de entradas con FluentValidation, aplicada automaticamente via un filtro global.
- Middleware global de excepciones: traduce errores a `ProblemDetails` sin exponer stack
  traces ni detalles internos en respuestas 500.
- Logging estructurado con Serilog (consola + archivo rotado diario en `logs/`).

### Endpoints principales

| Metodo | Ruta                          | Descripcion                                  |
|--------|-------------------------------|-----------------------------------------------|
| POST   | `/api/auth/login`             | Login, devuelve JWT                           |
| GET    | `/api/productos`               | Listado paginado, con busqueda                |
| POST   | `/api/productos`               | Crear producto                                |
| PUT    | `/api/productos/{id}`          | Editar / activar / desactivar producto        |
| POST   | `/api/movimientos/entrada`     | Registrar entrada de inventario               |
| POST   | `/api/movimientos/salida`      | Registrar salida (valida stock en el SP)      |
| GET    | `/api/movimientos/historial`   | Historial paginado, filtrable por producto    |
| GET    | `/api/inventario`               | Estado actual de inventario por producto      |
| GET    | `/api/usuarios`                 | Listado paginado de usuarios                  |
| POST   | `/api/usuarios`                 | Crear usuario (siempre rol `ADMIN`)           |
| PUT    | `/api/usuarios/{id}`            | Editar / activar / desactivar usuario         |

Todos los endpoints salvo `auth/login` requieren el header `Authorization: Bearer <token>`.

## 3. Frontend

```bash
cd frontend
npm install
npm start
```

La app queda disponible en `http://localhost:4200` y consume la API en
`http://localhost:5080/api` (configurable en `src/environments/environment.ts`).

> Nota macOS: si `sass-embedded` falla con un error de version minima de macOS,
> el `package.json` ya fija `sass-embedded` a `1.80.6`, version compatible con
> macOS 13. En macOS 14+ se puede volver a la ultima version sin problema.

### Decisiones de diseno

- **Tablas**: se evaluo DevExtreme (licencia comercial) y PrimeNG (desde la v22 exige
  licencia incluso en el core). Se opto por **ag-Grid Community**, MIT y sin condiciones de
  uso, con paginacion, filtros por columna y busqueda global en Productos, Inventario,
  Historial y Usuarios.
- **Tipografia**: Inter, alternativa libre y ampliamente usada en SaaS corporativo (Linear,
  Vercel, Stripe) como sustituto de SF Pro.
- **Iconos**: Material Symbols Outlined (trazo fino) en vez de Material Icons clasico, mismo
  componente `mat-icon`, cambio de bajo riesgo frente a reescribir todo con FontAwesome.
- **Layout**: el shell principal (sidebar + header) usa flexbox puro en vez de
  `mat-sidenav-container`, para que el contenido se expanda en sincronia real con el colapso
  del sidebar sin depender del calculo de margenes de Angular Material.

## Flujo de prueba sugerido

1. Login con `admin` / `Admin123!`.
2. Crear un producto nuevo y editarlo (incluye desactivar/reactivar).
3. Registrar una entrada de inventario para ese producto.
4. Registrar una salida valida y luego una salida que exceda el stock (debe
   rechazarse con un mensaje claro).
5. Revisar el inventario actual (estados Normal / Bajo / Agotado).
6. En el historial, hacer clic en un movimiento para ver el detalle y el historico
   completo del producto.
7. Crear un usuario nuevo, desactivarlo y confirmar que no puede iniciar sesion.
8. Probar el colapso del sidebar y la vista responsive en una ventana angosta.

## Limitaciones conocidas

- No hay suite de tests automatizados (unitarios/integracion); la verificacion de este
  proyecto se hizo de forma manual contra la API real y el navegador.
- El unico rol de usuario es `ADMIN`; no hay permisos diferenciados por accion.
- El refresh token no esta implementado: al expirar el JWT (60 min por defecto) el usuario
  debe iniciar sesion de nuevo.
