import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutPrincipal } from './shared/components/layout-principal';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: LayoutPrincipal,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/inventario/inventario-listado').then((m) => m.InventarioListado),
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/productos/productos-listado').then((m) => m.ProductosListado),
      },
      {
        path: 'movimientos/entrada',
        loadComponent: () => import('./features/movimientos/movimiento-formulario').then((m) => m.MovimientoFormulario),
        data: { tipo: 'entrada' },
      },
      {
        path: 'movimientos/salida',
        loadComponent: () => import('./features/movimientos/movimiento-formulario').then((m) => m.MovimientoFormulario),
        data: { tipo: 'salida' },
      },
      {
        path: 'movimientos/historial',
        loadComponent: () => import('./features/movimientos/movimiento-historial').then((m) => m.MovimientoHistorial),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios-listado').then((m) => m.UsuariosListado),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
