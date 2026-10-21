import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Movimiento } from '../../core/models/movimiento.model';
import { MovimientoDetalle } from './movimiento-detalle';

@Component({
  selector: 'app-movimiento-historial',
  standalone: true,
  imports: [MatProgressSpinnerModule, AgGridAngular],
  templateUrl: './movimiento-historial.html',
  styleUrl: './movimiento-historial.scss',
})
export class MovimientoHistorial implements OnInit {
  movimientos = signal<Movimiento[]>([]);
  cargando = signal(true);
  private readonly formateadorFecha = new DatePipe('es');

  columnas: ColDef<Movimiento>[] = [
    {
      headerName: 'Fecha',
      field: 'fecha',
      filter: 'agDateColumnFilter',
      minWidth: 170,
      valueFormatter: (p) => this.formateadorFecha.transform(p.value, 'dd/MM/yyyy HH:mm') ?? '',
    },
    { headerName: 'Producto', field: 'productoNombre', filter: 'agTextColumnFilter', flex: 1, minWidth: 220 },
    {
      headerName: 'Tipo',
      field: 'tipo',
      filter: 'agTextColumnFilter',
      minWidth: 120,
      cellRenderer: (p: { value: string }) =>
        `<span class="chip-estado ${p.value === 'ENTRADA' ? 'chip-entrada' : 'chip-salida'}">${p.value}</span>`,
    },
    { headerName: 'Cantidad', field: 'cantidad', filter: 'agNumberColumnFilter', minWidth: 120 },
  ];

  configuracionPorDefecto: ColDef = {
    sortable: true,
    resizable: true,
    floatingFilter: true,
  };

  constructor(
    private readonly movimientoService: MovimientoService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando.set(true);
    this.movimientoService.obtenerHistorial(1, 1000).subscribe({
      next: (resultado) => {
        this.movimientos.set(resultado.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onFilaClick(evento: RowClickedEvent<Movimiento>): void {
    if (evento.data) {
      this.dialog.open(MovimientoDetalle, { width: '520px', data: evento.data });
    }
  }
}
