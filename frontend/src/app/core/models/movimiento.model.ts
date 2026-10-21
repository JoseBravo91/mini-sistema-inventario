// Datos para registrar una entrada o salida de inventario
export interface RegistrarMovimiento {
  productoId: number;
  cantidad: number;
  observacion: string | null;
}

// Representacion de un movimiento en el historial
export interface Movimiento {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  fecha: string;
  usuario: string;
  observacion: string | null;
}
