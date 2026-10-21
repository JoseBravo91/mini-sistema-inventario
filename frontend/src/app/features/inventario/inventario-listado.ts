import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventarioService } from '../../core/services/inventario.service';
import { InventarioActual } from '../../core/models/inventario.model';

@Component({
  selector: 'app-inventario-listado',
  standalone: true,
  imports: [DecimalPipe, MatTableModule, MatChipsModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './inventario-listado.html',
  styleUrl: './inventario-listado.scss',
})
export class InventarioListado implements OnInit {
  columnas = ['codigo', 'nombre', 'precio', 'stockMinimo', 'stockActual', 'estado'];
  inventario = signal<InventarioActual[]>([]);
  cargando = signal(true);

  constructor(private readonly inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.cargando.set(true);
    this.inventarioService.obtenerInventarioActual().subscribe({
      next: (datos) => {
        this.inventario.set(datos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'NORMAL':
        return 'chip-normal';
      case 'BAJO':
        return 'chip-bajo';
      default:
        return 'chip-agotado';
    }
  }
}
