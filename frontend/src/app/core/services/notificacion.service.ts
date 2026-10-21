import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private readonly snackBar: MatSnackBar) {}

  mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['notificacion-error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['notificacion-exito'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  mostrarInfo(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 4000,
      panelClass: ['notificacion-info'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
