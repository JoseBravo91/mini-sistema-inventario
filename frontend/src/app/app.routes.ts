import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './features/login/login';
import { LayoutPrincipal } from './shared/components/layout-principal';
import { ProductosListado } from './features/productos/productos-listado';
import { MovimientoFormulario } from './features/movimientos/movimiento-formulario';
import { MovimientoHistorial } from './features/movimientos/movimiento-historial';
import { InventarioListado } from './features/inventario/inventario-listado';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: LayoutPrincipal,
    canActivate: [authGuard],
    children: [
      { path: 'inventario', component: InventarioListado },
      { path: 'productos', component: ProductosListado },
      { path: 'movimientos/entrada', component: MovimientoFormulario, data: { tipo: 'entrada' } },
      { path: 'movimientos/salida', component: MovimientoFormulario, data: { tipo: 'salida' } },
      { path: 'movimientos/historial', component: MovimientoHistorial },
      { path: '', redirectTo: 'inventario', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'inventario' },
];
