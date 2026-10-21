// Datos enviados al endpoint de login
export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

// Respuesta del backend con el token y datos basicos del usuario
export interface LoginResponse {
  token: string;
  expiraEn: string;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
}
