import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Adjunta el token JWT a toda peticion saliente hacia la API
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();

  if (!token) {
    return next(req);
  }

  const requestConToken = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(requestConToken);
};
