import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { InventarioService } from '../../core/services/inventario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Producto } from '../../core/models/producto.model';
import { InventarioActual } from '../../core/models/inventario.model';
import { InventarioResumenDialog } from './inventario-resumen-dialog';

@Component({
  selector: 'app-movimiento-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './movimiento-formulario.html',
  styleUrl: './movimiento-formulario.scss',
})
export class MovimientoFormulario implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  @ViewChild(FormGroupDirective) formularioDirective!: FormGroupDirective;

  tipoMovimiento: 'entrada' | 'salida' = 'entrada';
  productos = signal<Producto[]>([]);
  inventario = signal<InventarioActual[]>([]);
  guardando = signal(false);
  productoIdSeleccionado = signal<number | null>(null);

  // Texto visible en el campo de busqueda del producto; se maneja aparte del FormGroup
  // a proposito (en vez de formControlName) para controlar nosotros mismos cuando se
  // limpia la seleccion, sin depender del comportamiento interno de MatAutocomplete.
  textoBusquedaProducto = signal('');

  formulario = this.formBuilder.group({
    productoId: [null as number | null, [Validators.required]],
    cantidad: [null as number | null, [Validators.required, Validators.min(1)]],
    observacion: ['', [Validators.maxLength(500)]],
  });

  productosFiltrados = computed(() => {
    const texto = this.textoBusquedaProducto().trim().toLowerCase();
    if (!texto) {
      return this.productos();
    }
    return this.productos().filter(
      (p) => p.codigo.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto)
    );
  });

  inventarioSeleccionado = computed(() => {
    const id = this.productoIdSeleccionado();
    if (!id) {
      return null;
    }
    return this.inventario().find((i) => i.productoId === id) ?? null;
  });

  ngOnInit(): void {
    this.tipoMovimiento = this.route.snapshot.data['tipo'] ?? 'entrada';
    this.cargarProductos();
    this.cargarInventario();
  }

  get titulo(): string {
    return this.tipoMovimiento === 'entrada' ? 'Registrar entrada' : 'Registrar salida';
  }

  get esEntrada(): boolean {
    return this.tipoMovimiento === 'entrada';
  }

  cargarProductos(): void {
    this.productoService.listar(1, 1000).subscribe({
      next: (resultado) => this.productos.set(resultado.items.filter((p) => p.activo)),
    });
  }

  cargarInventario(): void {
    this.inventarioService.obtenerInventarioActual().subscribe({
      next: (datos) => this.inventario.set(datos),
    });
  }

  etiquetaProducto(productoId: number | null): string {
    const producto = this.productos().find((p) => p.id === productoId);
    return producto ? `${producto.codigo} · ${producto.nombre}` : '';
  }

  onBusquedaProductoInput(evento: Event): void {
    const texto = (evento.target as HTMLInputElement).value;
    this.textoBusquedaProducto.set(texto);

    // Si el texto ya no coincide con la etiqueta del producto seleccionado, se invalida esa seleccion
    if (this.productoIdSeleccionado() !== null && texto !== this.etiquetaProducto(this.productoIdSeleccionado())) {
      this.formulario.patchValue({ productoId: null });
      this.productoIdSeleccionado.set(null);
    }
  }

  onProductoSeleccionado(evento: MatAutocompleteSelectedEvent): void {
    const productoId = evento.option.value as number;
    this.formulario.patchValue({ productoId });
    this.formulario.get('productoId')?.markAsTouched();
    this.productoIdSeleccionado.set(productoId);
    this.textoBusquedaProducto.set(this.etiquetaProducto(productoId));
  }

  abrirInventario(): void {
    if (this.esEntrada) {
      // Entrada: el producto creado mas recientemente primero (id mas alto = mas nuevo)
      const ordenado = [...this.inventario()].sort((a, b) => b.productoId - a.productoId);
      this.mostrarDialogoInventario(ordenado);
      return;
    }

    // Salida: el producto con el movimiento mas reciente primero, segun el historial real
    this.movimientoService.obtenerHistorial(1, 500).subscribe({
      next: (resultado) => {
        const ordenRecencia = new Map<number, number>();
        resultado.items.forEach((movimiento) => {
          if (!ordenRecencia.has(movimiento.productoId)) {
            ordenRecencia.set(movimiento.productoId, ordenRecencia.size);
          }
        });

        const ordenado = [...this.inventario()].sort((a, b) => {
          const posicionA = ordenRecencia.get(a.productoId) ?? Number.MAX_SAFE_INTEGER;
          const posicionB = ordenRecencia.get(b.productoId) ?? Number.MAX_SAFE_INTEGER;
          return posicionA - posicionB;
        });
        this.mostrarDialogoInventario(ordenado);
      },
      error: () => this.mostrarDialogoInventario(this.inventario()),
    });
  }

  private mostrarDialogoInventario(itemsOrdenados: InventarioActual[]): void {
    const referencia = this.dialog.open(InventarioResumenDialog, {
      width: '520px',
      data: itemsOrdenados,
    });

    referencia.afterClosed().subscribe((seleccionado: InventarioActual | undefined) => {
      if (seleccionado) {
        this.formulario.patchValue({ productoId: seleccionado.productoId });
        this.formulario.get('productoId')?.markAsTouched();
        this.productoIdSeleccionado.set(seleccionado.productoId);
        this.textoBusquedaProducto.set(this.etiquetaProducto(seleccionado.productoId));
      }
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

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const valores = this.formulario.getRawValue();
    const dto = {
      productoId: valores.productoId!,
      cantidad: valores.cantidad!,
      observacion: valores.observacion || null,
    };

    const operacion = this.esEntrada ? this.movimientoService.registrarEntrada(dto) : this.movimientoService.registrarSalida(dto);

    operacion.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(this.esEntrada ? 'Entrada registrada correctamente' : 'Salida registrada correctamente');
        // resetForm() limpia tambien el flag "submitted" del formulario, que es lo que
        // mantenia los campos marcados en rojo aunque ya estuvieran vacios
        this.formularioDirective.resetForm();
        this.textoBusquedaProducto.set('');
        this.productoIdSeleccionado.set(null);
        this.guardando.set(false);
        this.cargarInventario();
      },
      error: () => this.guardando.set(false),
    });
  }
}
