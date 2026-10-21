import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';
import { ProductoFormulario } from './producto-formulario';

@Component({
  selector: 'app-productos-listado',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './productos-listado.html',
  styleUrl: './productos-listado.scss',
})
export class ProductosListado implements OnInit {
  columnas = ['codigo', 'nombre', 'precio', 'stockMinimo', 'activo', 'acciones'];
  productos = signal<Producto[]>([]);
  totalRegistros = signal(0);
  cargando = signal(true);
  pagina = 0;
  tamanoPagina = 10;
  controlBusqueda = new FormControl('');

  constructor(
    private readonly productoService: ProductoService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarProductos();

    this.controlBusqueda.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.pagina = 0;
      this.cargarProductos();
    });
  }

  cargarProductos(): void {
    this.cargando.set(true);
    const busqueda = this.controlBusqueda.value ?? undefined;

    this.productoService.listar(this.pagina + 1, this.tamanoPagina, busqueda || undefined).subscribe({
      next: (resultado) => {
        this.productos.set(resultado.items);
        this.totalRegistros.set(resultado.totalRegistros);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.tamanoPagina = evento.pageSize;
    this.cargarProductos();
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
