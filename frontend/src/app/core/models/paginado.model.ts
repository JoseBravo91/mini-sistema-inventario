// Envoltorio generico de respuestas paginadas de la API
export interface ResultadoPaginado<T> {
  items: T[];
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
}
