import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-formulario.html',
  styleUrl: './usuario-formulario.scss',
})
export class UsuarioFormulario {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioFormulario>);
  usuarioExistente = inject<Usuario | null>(MAT_DIALOG_DATA);

  guardando = signal(false);
  esEdicion = !!this.usuarioExistente;

  formulario = this.formBuilder.group({
    nombreUsuario: [
      { value: this.usuarioExistente?.nombreUsuario ?? '', disabled: this.esEdicion },
      [Validators.required, Validators.maxLength(50)],
    ],
    nombreCompleto: [this.usuarioExistente?.nombreCompleto ?? '', [Validators.required, Validators.maxLength(150)]],
    contrasena: [
      '',
      this.esEdicion ? [Validators.minLength(8), Validators.maxLength(100)] : [Validators.required, Validators.minLength(8), Validators.maxLength(100)],
    ],
    activo: [this.usuarioExistente?.activo ?? true],
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const valores = this.formulario.getRawValue();

    const operacion = this.esEdicion
      ? this.usuarioService.actualizar(this.usuarioExistente!.id, {
          nombreCompleto: valores.nombreCompleto!,
          activo: valores.activo!,
          nuevaContrasena: valores.contrasena || null,
        })
      : this.usuarioService.crear({
          nombreUsuario: valores.nombreUsuario!,
          contrasena: valores.contrasena!,
          nombreCompleto: valores.nombreCompleto!,
        });

    operacion.subscribe({
      next: () => {
        this.notificacionService.mostrarExito(this.esEdicion ? 'Usuario actualizado' : 'Usuario creado');
        this.dialogRef.close(true);
      },
      error: () => this.guardando.set(false),
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
