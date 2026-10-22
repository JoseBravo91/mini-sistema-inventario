import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ProductoService } from '../../core/services/producto.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { CloudinarioService } from '../../core/services/cloudinario.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-producto-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './producto-formulario.html',
  styleUrl: './producto-formulario.scss',
})
export class ProductoFormulario {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly cloudinarioService = inject(CloudinarioService);
  private readonly dialogRef = inject(MatDialogRef<ProductoFormulario>);
  productoExistente = inject<Producto | null>(MAT_DIALOG_DATA);

  guardando = signal(false);
  subiendoImagen = signal(false);
  imagenUrl = signal<string | null>(this.productoExistente?.imagenUrl ?? null);
  esEdicion = !!this.productoExistente;

  formulario = this.formBuilder.group({
    codigo: [this.productoExistente?.codigo ?? '', [Validators.required, Validators.maxLength(30)]],
    nombre: [this.productoExistente?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    descripcion: [this.productoExistente?.descripcion ?? '', [Validators.maxLength(500)]],
    precio: [this.productoExistente?.precio ?? 0, [Validators.required, Validators.min(0)]],
    stockMinimo: [this.productoExistente?.stockMinimo ?? 10, [Validators.required, Validators.min(0)]],
    activo: [this.productoExistente?.activo ?? true],
  });

  seleccionarImagen(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) {
      return;
    }

    this.subiendoImagen.set(true);
    this.cloudinarioService.subirImagen(archivo).subscribe({
      next: (url) => {
        this.imagenUrl.set(url);
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.notificacionService.mostrarError('No se pudo subir la imagen, intenta de nuevo');
        this.subiendoImagen.set(false);
      },
    });
  }

  quitarImagen(): void {
    this.imagenUrl.set(null);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const valores = this.formulario.getRawValue();

    const operacion = this.esEdicion
      ? this.productoService.actualizar(this.productoExistente!.id, {
          nombre: valores.nombre!,
          descripcion: valores.descripcion || null,
          precio: valores.precio!,
          stockMinimo: valores.stockMinimo!,
          activo: valores.activo!,
          imagenUrl: this.imagenUrl(),
        })
      : this.productoService.crear({
          codigo: valores.codigo!,
          nombre: valores.nombre!,
          descripcion: valores.descripcion || null,
          precio: valores.precio!,
          stockMinimo: valores.stockMinimo!,
          imagenUrl: this.imagenUrl(),
        });

    operacion.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(this.esEdicion ? 'Producto actualizado' : 'Producto creado');
        this.dialogRef.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
