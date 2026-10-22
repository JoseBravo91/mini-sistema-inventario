import { Component, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { InventarioService } from '../../core/services/inventario.service';
import { InventarioActual } from '../../core/models/inventario.model';

@Component({
  selector: 'app-inventario-listado',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatTooltipModule, AgGridAngular],
  templateUrl: './inventario-listado.html',
  styleUrl: './inventario-listado.scss',
})
export class InventarioListado implements OnInit {
  inventario = signal<InventarioActual[]>([]);
  cargando = signal(true);

  columnas: ColDef<InventarioActual>[] = [
    {
      headerName: '',
      field: 'imagenUrl',
      colId: 'imagen',
      sortable: false,
      filter: false,
      resizable: false,
      width: 56,
      cellRenderer: (p: { value: string | null }) =>
        p.value
          ? `<div class="celda-miniatura"><img src="${p.value}" alt="" /></div>`
          : '<div class="celda-miniatura"><span class="material-symbols-outlined">inventory_2</span></div>',
    },
    { headerName: 'Codigo', field: 'codigo', filter: 'agTextColumnFilter', width: 120 },
    { headerName: 'Producto', field: 'nombre', filter: 'agTextColumnFilter', flex: 1, minWidth: 180 },
    {
      headerName: 'Precio',
      field: 'precio',
      filter: 'agNumberColumnFilter',
      width: 110,
      valueFormatter: (p) => (p.value != null ? Number(p.value).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''),
    },
    { headerName: 'Stock minimo', field: 'stockMinimo', filter: 'agNumberColumnFilter', width: 110 },
    { headerName: 'Stock actual', field: 'stockActual', filter: 'agNumberColumnFilter', width: 110 },
    {
      headerName: 'Estado',
      field: 'estado',
      filter: 'agTextColumnFilter',
      width: 110,
      cellRenderer: (p: { value: string }) => `<span class="chip-estado ${this.claseEstado(p.value)}">${p.value}</span>`,
    },
  ];

  configuracionPorDefecto: ColDef = {
    sortable: true,
    resizable: true,
    floatingFilter: true,
  };

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
