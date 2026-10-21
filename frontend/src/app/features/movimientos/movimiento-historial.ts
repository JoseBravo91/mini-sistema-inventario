import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Movimiento } from '../../core/models/movimiento.model';

@Component({
  selector: 'app-movimiento-historial',
  standalone: true,
  imports: [DatePipe, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './movimiento-historial.html',
  styleUrl: './movimiento-historial.scss',
})
export class MovimientoHistorial implements OnInit {
  columnas = ['fecha', 'productoNombre', 'tipo', 'cantidad', 'usuario', 'observacion'];
  movimientos = signal<Movimiento[]>([]);
  totalRegistros = signal(0);
  cargando = signal(true);
  pagina = 0;
  tamanoPagina = 10;

  constructor(private readonly movimientoService: MovimientoService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando.set(true);
    this.movimientoService.obtenerHistorial(this.pagina + 1, this.tamanoPagina).subscribe({
      next: (resultado) => {
        this.movimientos.set(resultado.items);
        this.totalRegistros.set(resultado.totalRegistros);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.tamanoPagina = evento.pageSize;
    this.cargarHistorial();
  }
}
