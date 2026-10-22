import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

// Adjunta el token JWT solo a peticiones hacia nuestra propia API, nunca a servicios externos (ej. Cloudinary)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

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
