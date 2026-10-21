# MiniSistema de Gestion de Inventario

Prueba tecnica: backend en C# (.NET 8) + PostgreSQL, frontend en Angular (standalone components).

## Estructura

```
/backend   API REST en .NET 8 (Controllers -> Services -> Repositories)
/frontend  Angular con Material
/database  schema.sql: tablas, stored procedures, funcion y datos semilla
```

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
el Bearer token). El CORS esta restringido a `http://localhost:4200` (configurable en
`appsettings.json` bajo `Cors:FrontendOrigin`).

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

## Flujo de prueba sugerido

1. Login con `admin` / `Admin123!`.
2. Crear un producto nuevo.
3. Registrar una entrada de inventario para ese producto.
4. Registrar una salida valida y luego una salida que exceda el stock (debe
   rechazarse con un mensaje claro).
5. Revisar el inventario actual (estados Normal / Bajo / Agotado) y el historial
   de movimientos.
