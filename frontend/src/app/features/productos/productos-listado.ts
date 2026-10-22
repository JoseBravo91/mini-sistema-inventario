import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import type { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { debounceTime } from 'rxjs';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';
import { ProductoFormulario } from './producto-formulario';
import { ProductoDetalleDialog } from './producto-detalle-dialog';

@Component({
  selector: 'app-productos-listado',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AgGridAngular,
  ],
  templateUrl: './productos-listado.html',
  styleUrl: './productos-listado.scss',
})
export class ProductosListado implements OnInit {
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  textoFiltro = '';
  controlBusqueda = new FormControl('');

  columnas: ColDef<Producto>[] = [
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
    { headerName: 'Nombre', field: 'nombre', filter: 'agTextColumnFilter', flex: 1, minWidth: 180 },
    {
      headerName: 'Precio',
      field: 'precio',
      filter: 'agNumberColumnFilter',
      width: 110,
      valueFormatter: (p) => (p.value != null ? Number(p.value).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''),
    },
    { headerName: 'Stock minimo', field: 'stockMinimo', filter: 'agNumberColumnFilter', width: 120 },
    {
      headerName: 'Estado',
      field: 'activo',
      filter: 'agTextColumnFilter',
      width: 110,
      cellRenderer: (p: { value: boolean }) =>
        p.value
          ? '<span class="chip-estado chip-activo">Activo</span>'
          : '<span class="chip-estado chip-inactivo">Inactivo</span>',
    },
    {
      headerName: 'Acciones',
      colId: 'acciones',
      sortable: false,
      filter: false,
      resizable: false,
      width: 100,
      cellRenderer: () => '<button type="button" class="celda-accion-boton" aria-label="Editar producto"><span class="material-symbols-outlined">edit</span></button>',
    },
  ];

  configuracionPorDefecto: ColDef = {
    sortable: true,
    resizable: true,
    floatingFilter: true,
  };

  constructor(
    private readonly productoService: ProductoService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarProductos();

    this.controlBusqueda.valueChanges.pipe(debounceTime(300)).subscribe((valor) => {
      this.textoFiltro = valor ?? '';
    });
  }

  cargarProductos(): void {
    this.cargando.set(true);
    this.productoService.listar(1, 1000).subscribe({
      next: (resultado) => {
        this.productos.set(resultado.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onGridReady(_evento: GridReadyEvent): void {}

  onCeldaClick(evento: CellClickedEvent<Producto>): void {
    if (!evento.data) {
      return;
    }

    if (evento.column.getColId() === 'acciones') {
      this.abrirFormularioEditar(evento.data);
    } else {
      this.abrirDetalle(evento.data);
    }
  }

  abrirDetalle(producto: Producto): void {
    this.dialog.open(ProductoDetalleDialog, { width: '440px', data: producto });
  }

  abrirFormularioCrear(): void {
    const referencia = this.dialog.open(ProductoFormulario, { width: '480px' });
    referencia.afterClosed().subscribe((seGuardo) => {
      if (seGuardo) {
        this.cargarProductos();
      }
    });
  }

  abrirFormularioEditar(producto: Producto): void {
    const referencia = this.dialog.open(ProductoFormulario, { width: '480px', data: producto });
    referencia.afterClosed().subscribe((seGuardo) => {
      if (seGuardo) {
        this.cargarProductos();
      }
    });
  }
}
