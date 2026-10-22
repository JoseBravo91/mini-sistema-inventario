// Estado actual de inventario por producto, calculado en el backend
export interface InventarioActual {
  productoId: number;
  codigo: string;
  nombre: string;
  precio: number;
  stockMinimo: number;
  imagenUrl: string | null;
  stockActual: number;
  estado: 'NORMAL' | 'BAJO' | 'AGOTADO';
}
