// Representacion de un producto segun la API
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stockMinimo: number;
  activo: boolean;
}

// Datos para crear un nuevo producto
export interface CrearProducto {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stockMinimo: number;
}

// Datos para actualizar un producto existente
export interface ActualizarProducto {
  nombre: string;
  descripcion: string | null;
  precio: number;
  stockMinimo: number;
  activo: boolean;
}
