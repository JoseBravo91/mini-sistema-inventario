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
    { headerName: 'Codigo', field: 'codigo', filter: 'agTextColumnFilter', minWidth: 130 },
    { headerName: 'Nombre', field: 'nombre', filter: 'agTextColumnFilter', flex: 1, minWidth: 220 },
    {
      headerName: 'Precio',
      field: 'precio',
      filter: 'agNumberColumnFilter',
      minWidth: 130,
      valueFormatter: (p) => (p.value != null ? Number(p.value).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''),
    },
    { headerName: 'Stock minimo', field: 'stockMinimo', filter: 'agNumberColumnFilter', minWidth: 140 },
    {
      headerName: 'Estado',
      field: 'activo',
      filter: 'agTextColumnFilter',
      minWidth: 120,
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
      minWidth: 110,
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
    if (evento.column.getColId() === 'acciones' && evento.data) {
      this.abrirFormularioEditar(evento.data);
    }
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
