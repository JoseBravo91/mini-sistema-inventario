import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const CLAVE_TOKEN = 'inventario_token';
const CLAVE_USUARIO = 'inventario_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Senal reactiva con los datos del usuario autenticado, null si no hay sesion
  usuarioActual = signal<LoginResponse | null>(this.recuperarUsuario());

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((respuesta) => this.guardarSesion(respuesta))
    );
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuarioActual.set(null);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  // Actualiza el nombre en cache cuando el usuario edita su propio perfil, sin requerir un nuevo login
  actualizarNombreCompleto(nombreCompleto: string): void {
    const actual = this.usuarioActual();
    if (!actual) {
      return;
    }

    const actualizado: LoginResponse = { ...actual, nombreCompleto };
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(actualizado));
    this.usuarioActual.set(actualizado);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private guardarSesion(respuesta: LoginResponse): void {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta));
    this.usuarioActual.set(respuesta);
  }

  private recuperarUsuario(): LoginResponse | null {
    const datos = localStorage.getItem(CLAVE_USUARIO);
    return datos ? JSON.parse(datos) : null;
  }
}
