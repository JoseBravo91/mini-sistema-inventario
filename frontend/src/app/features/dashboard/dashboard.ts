import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ProductoService } from '../../core/services/producto.service';
import { InventarioService } from '../../core/services/inventario.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Producto } from '../../core/models/producto.model';
import { InventarioActual } from '../../core/models/inventario.model';
import { Movimiento } from '../../core/models/movimiento.model';

interface ProductoDestacado {
  nombre: string;
  codigo: string;
  imagenUrl: string | null;
  etiqueta: string;
}

const COLOR_ACCENT = '#0369a1';
const COLOR_DESTRUCTIVE = '#dc2626';
const COLOR_SUCCESS = '#15803d';
const COLOR_WARNING = '#c2410c';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe, MatProgressSpinnerModule, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  cargando = signal(true);

  private readonly productos = signal<Producto[]>([]);
  private readonly inventario = signal<InventarioActual[]>([]);
  private readonly movimientos = signal<Movimiento[]>([]);
  private readonly formateadorFecha = new DatePipe('es');

  totalProductosActivos = computed(() => this.productos().filter((p) => p.activo).length);
  totalUnidadesStock = computed(() => this.inventario().reduce((suma, i) => suma + Number(i.stockActual), 0));
  productosCriticos = computed(() => this.inventario().filter((i) => i.estado !== 'NORMAL'));
  totalEntradas = computed(() => this.movimientos().filter((m) => m.tipo === 'ENTRADA').length);
  totalSalidas = computed(() => this.movimientos().filter((m) => m.tipo === 'SALIDA').length);

  productoMasVendido = computed<ProductoDestacado | null>(() => {
    const acumulado = new Map<number, number>();
    for (const movimiento of this.movimientos()) {
      if (movimiento.tipo === 'SALIDA') {
        acumulado.set(movimiento.productoId, (acumulado.get(movimiento.productoId) ?? 0) + movimiento.cantidad);
      }
    }
    if (acumulado.size === 0) {
      return null;
    }

    const [productoId, cantidad] = [...acumulado.entries()].sort((a, b) => b[1] - a[1])[0];
    const producto = this.productos().find((p) => p.id === productoId);
    if (!producto) {
      return null;
    }

    return { nombre: producto.nombre, codigo: producto.codigo, imagenUrl: producto.imagenUrl, etiqueta: `${cantidad} unidades vendidas` };
  });

  productoConMasStock = computed<ProductoDestacado | null>(() => {
    const items = this.inventario();
    if (items.length === 0) {
      return null;
    }

    const top = [...items].sort((a, b) => Number(b.stockActual) - Number(a.stockActual))[0];
    return { nombre: top.nombre, codigo: top.codigo, imagenUrl: top.imagenUrl, etiqueta: `${top.stockActual} unidades en stock` };
  });

  productoMasActualizado = computed<ProductoDestacado | null>(() => {
    const actualizados = this.productos().filter((p) => p.fechaActualizacion);
    if (actualizados.length === 0) {
      return null;
    }

    const top = [...actualizados].sort(
      (a, b) => new Date(b.fechaActualizacion!).getTime() - new Date(a.fechaActualizacion!).getTime()
    )[0];
    const fecha = this.formateadorFecha.transform(top.fechaActualizacion, 'dd/MM/yyyy HH:mm');
    return { nombre: top.nombre, codigo: top.codigo, imagenUrl: top.imagenUrl, etiqueta: `Actualizado el ${fecha}` };
  });

  actividadReciente = computed(() =>
    [...this.movimientos()].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 6)
  );

  datosEstado = computed<ChartData<'doughnut'>>(() => {
    const items = this.inventario();
    const normal = items.filter((i) => i.estado === 'NORMAL').length;
    const bajo = items.filter((i) => i.estado === 'BAJO').length;
    const agotado = items.filter((i) => i.estado === 'AGOTADO').length;

    return {
      labels: ['Normal', 'Bajo', 'Agotado'],
      datasets: [{ data: [normal, bajo, agotado], backgroundColor: [COLOR_SUCCESS, COLOR_WARNING, COLOR_DESTRUCTIVE], borderWidth: 0 }],
    };
  });

  opcionesEstado: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter' } } } },
  };

  datosMovimientos = computed<ChartData<'bar'>>(() => {
    const dias = this.ultimosDias(7);
    const entradas = dias.map((dia) => this.sumaPorDiaYTipo(dia, 'ENTRADA'));
    const salidas = dias.map((dia) => this.sumaPorDiaYTipo(dia, 'SALIDA'));

    return {
      labels: dias.map((dia) => this.formateadorFecha.transform(dia, 'dd/MM') ?? ''),
      datasets: [
        { label: 'Entradas', data: entradas, backgroundColor: COLOR_ACCENT, borderRadius: 4, maxBarThickness: 28 },
        { label: 'Salidas', data: salidas, backgroundColor: COLOR_DESTRUCTIVE, borderRadius: 4, maxBarThickness: 28 },
      ],
    };
  });

  opcionesMovimientos: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } },
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter' } } } },
  };

  constructor(
    private readonly productoService: ProductoService,
    private readonly inventarioService: InventarioService,
    private readonly movimientoService: MovimientoService
  ) {}

  ngOnInit(): void {
    this.cargando.set(true);
    forkJoin({
      productos: this.productoService.listar(1, 1000),
      inventario: this.inventarioService.obtenerInventarioActual(),
      movimientos: this.movimientoService.obtenerHistorial(1, 1000),
    }).subscribe({
      next: ({ productos, inventario, movimientos }) => {
        this.productos.set(productos.items);
        this.inventario.set(inventario);
        this.movimientos.set(movimientos.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  private ultimosDias(cantidad: number): Date[] {
    const dias: Date[] = [];
    const hoy = new Date();
    for (let i = cantidad - 1; i >= 0; i--) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() - i);
      dias.push(dia);
    }
    return dias;
  }

  private sumaPorDiaYTipo(dia: Date, tipo: 'ENTRADA' | 'SALIDA'): number {
    const clave = dia.toDateString();
    return this.movimientos()
      .filter((m) => m.tipo === tipo && new Date(m.fecha).toDateString() === clave)
      .reduce((suma, m) => suma + m.cantidad, 0);
  }
}
