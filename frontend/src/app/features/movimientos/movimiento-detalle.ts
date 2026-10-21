import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Movimiento } from '../../core/models/movimiento.model';

@Component({
  selector: 'app-movimiento-detalle',
  standalone: true,
  imports: [DatePipe, MatDialogModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './movimiento-detalle.html',
  styleUrl: './movimiento-detalle.scss',
})
export class MovimientoDetalle implements OnInit {
  private readonly movimientoService = inject(MovimientoService);
  private readonly dialogRef = inject(MatDialogRef<MovimientoDetalle>);
  movimiento = inject<Movimiento>(MAT_DIALOG_DATA);

  historialProducto = signal<Movimiento[]>([]);
  cargandoHistorial = signal(true);

  ngOnInit(): void {
    this.movimientoService.obtenerHistorial(1, 1000, this.movimiento.productoId).subscribe({
      next: (resultado) => {
        this.historialProducto.set(resultado.items);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false),
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
