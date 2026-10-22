import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { InventarioActual } from '../../core/models/inventario.model';

type Columna = 'codigo' | 'nombre' | 'stock' | 'estado';

const PRIORIDAD_ESTADO: Record<string, number> = { AGOTADO: 0, BAJO: 1, NORMAL: 2 };

@Component({
  selector: 'app-inventario-resumen-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatPaginatorModule],
  templateUrl: './inventario-resumen-dialog.html',
  styleUrl: './inventario-resumen-dialog.scss',
})
export class InventarioResumenDialog {
  private readonly dialogRef = inject(MatDialogRef<InventarioResumenDialog>);

  // El arreglo ya llega pre-ordenado por defecto (mas reciente primero, segun el modulo
  // que abrio el dialogo); aqui solo se filtra, se reordena si el usuario hace clic en
  // una columna, y se pagina.
  inventario = inject<InventarioActual[]>(MAT_DIALOG_DATA);

  texto = signal('');
  columnaOrden = signal<Columna | null>(null);
  direccionOrden = signal<'asc' | 'desc'>('asc');
  pagina = signal(0);
  tamanoPagina = 8;

  filtrado = computed(() => {
    const texto = this.texto().trim().toLowerCase();
    if (!texto) {
      return this.inventario;
    }
    return this.inventario.filter(
      (i) => i.codigo.toLowerCase().includes(texto) || i.nombre.toLowerCase().includes(texto)
    );
  });

  ordenado = computed(() => {
    const columna = this.columnaOrden();
    const lista = this.filtrado();
    if (!columna) {
      return lista;
    }

    const factor = this.direccionOrden() === 'asc' ? 1 : -1;
    return [...lista].sort((a, b) => {
      switch (columna) {
        case 'codigo':
          return a.codigo.localeCompare(b.codigo) * factor;
        case 'nombre':
          return a.nombre.localeCompare(b.nombre) * factor;
        case 'stock':
          return (a.stockActual - b.stockActual) * factor;
        case 'estado':
          return (PRIORIDAD_ESTADO[a.estado] - PRIORIDAD_ESTADO[b.estado]) * factor;
      }
    });
  });

  paginaActual = computed(() => {
    const inicio = this.pagina() * this.tamanoPagina;
    return this.ordenado().slice(inicio, inicio + this.tamanoPagina);
  });

  onBuscarInput(evento: Event): void {
    this.texto.set((evento.target as HTMLInputElement).value);
    this.pagina.set(0);
  }

  ordenarPor(columna: Columna): void {
    if (this.columnaOrden() === columna) {
      this.direccionOrden.set(this.direccionOrden() === 'asc' ? 'desc' : 'asc');
    } else {
      this.columnaOrden.set(columna);
      this.direccionOrden.set('asc');
    }
    this.pagina.set(0);
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
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

  seleccionar(item: InventarioActual): void {
    this.dialogRef.close(item);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
