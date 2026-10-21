import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

// Centraliza el manejo de errores HTTP y muestra mensajes claros al usuario
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notificacionService = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = obtenerMensaje(error);

      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }

      notificacionService.mostrarError(mensaje);
      return throwError(() => error);
    })
  );
};

function obtenerMensaje(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor';
  }
  if (error.status === 401) {
    return 'Debe iniciar sesion nuevamente';
  }
  if (error.status === 429) {
    return 'Demasiados intentos, espere un momento';
  }
  if (error.error?.detail) {
    return error.error.detail;
  }
  return 'Ocurrio un error inesperado';
}
