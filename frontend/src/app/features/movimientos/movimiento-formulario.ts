import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { InventarioService } from '../../core/services/inventario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Producto } from '../../core/models/producto.model';
import { InventarioActual } from '../../core/models/inventario.model';

@Component({
  selector: 'app-movimiento-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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

  tipoMovimiento: 'entrada' | 'salida' = 'entrada';
  productos = signal<Producto[]>([]);
  inventario = signal<InventarioActual[]>([]);
  guardando = signal(false);
  productoIdSeleccionado = signal<number | null>(null);

  formulario = this.formBuilder.group({
    productoId: [null as number | null, [Validators.required]],
    cantidad: [null as number | null, [Validators.required, Validators.min(1)]],
    observacion: ['', [Validators.maxLength(500)]],
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

    this.formulario.get('productoId')?.valueChanges.subscribe((id) => this.productoIdSeleccionado.set(id));
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
        this.formulario.reset();
        this.productoIdSeleccionado.set(null);
        this.guardando.set(false);
        this.cargarInventario();
      },
      error: () => this.guardando.set(false),
    });
  }
}
