// Representacion de un usuario segun la API
export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
}

// Datos para crear un nuevo usuario, siempre se crea con rol ADMIN
export interface CrearUsuario {
  nombreUsuario: string;
  contrasena: string;
  nombreCompleto: string;
}

// Datos para actualizar un usuario existente, la contrasena es opcional
export interface ActualizarUsuario {
  nombreCompleto: string;
  activo: boolean;
  nuevaContrasena: string | null;
}
