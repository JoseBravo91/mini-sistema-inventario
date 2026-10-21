import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-movimiento-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './movimiento-formulario.html',
  styleUrl: './movimiento-formulario.scss',
})
export class MovimientoFormulario implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly route = inject(ActivatedRoute);

  tipoMovimiento: 'entrada' | 'salida' = 'entrada';
  productos = signal<Producto[]>([]);
  guardando = signal(false);

  formulario = this.formBuilder.group({
    productoId: [null as number | null, [Validators.required]],
    cantidad: [null as number | null, [Validators.required, Validators.min(1)]],
    observacion: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.tipoMovimiento = this.route.snapshot.data['tipo'] ?? 'entrada';
    this.cargarProductos();
  }

  get titulo(): string {
    return this.tipoMovimiento === 'entrada' ? 'Registrar entrada' : 'Registrar salida';
  }

  cargarProductos(): void {
    this.productoService.listar(1, 100).subscribe({
      next: (resultado) => this.productos.set(resultado.items.filter((p) => p.activo)),
    });
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

    const operacion =
      this.tipoMovimiento === 'entrada'
        ? this.movimientoService.registrarEntrada(dto)
        : this.movimientoService.registrarSalida(dto);

    operacion.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(
          this.tipoMovimiento === 'entrada' ? 'Entrada registrada correctamente' : 'Salida registrada correctamente'
        );
        this.formulario.reset();
        this.guardando.set(false);
      },
      error: () => this.guardando.set(false),
    });
  }
}
