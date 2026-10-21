// Estado actual de inventario por producto, calculado en el backend
export interface InventarioActual {
  productoId: number;
  codigo: string;
  nombre: string;
  precio: number;
  stockMinimo: number;
  stockActual: number;
  estado: 'NORMAL' | 'BAJO' | 'AGOTADO';
}
