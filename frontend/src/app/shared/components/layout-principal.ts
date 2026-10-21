import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

const CLAVE_SIDEBAR_COLAPSADO = 'inventario_sidebar_colapsado';

@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
  ],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.scss',
})
export class LayoutPrincipal {
  colapsado = signal(this.recuperarPreferenciaColapsado());

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get usuario() {
    return this.authService.usuarioActual();
  }

  alternarSidebar(): void {
    const nuevoValor = !this.colapsado();
    this.colapsado.set(nuevoValor);
    try {
      localStorage.setItem(CLAVE_SIDEBAR_COLAPSADO, String(nuevoValor));
    } catch {
      // almacenamiento no disponible, se ignora
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private recuperarPreferenciaColapsado(): boolean {
    try {
      return localStorage.getItem(CLAVE_SIDEBAR_COLAPSADO) === 'true';
    } catch {
      return false;
    }
  }
}
