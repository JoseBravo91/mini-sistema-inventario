import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-producto-detalle-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './producto-detalle-dialog.html',
  styleUrl: './producto-detalle-dialog.scss',
})
export class ProductoDetalleDialog {
  private readonly dialogRef = inject(MatDialogRef<ProductoDetalleDialog>);
  producto = inject<Producto>(MAT_DIALOG_DATA);

  cerrar(): void {
    this.dialogRef.close();
  }
}
