import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarProducto, CrearProducto, Producto } from '../models/producto.model';
import { ResultadoPaginado } from '../models/paginado.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly baseUrl = `${environment.apiUrl}/productos`;

  constructor(private readonly http: HttpClient) {}

  listar(pagina: number, tamanoPagina: number, busqueda?: string): Observable<ResultadoPaginado<Producto>> {
    const parametros: Record<string, string> = {
      pagina: pagina.toString(),
      tamanoPagina: tamanoPagina.toString(),
    };
    if (busqueda) {
      parametros['busqueda'] = busqueda;
    }

    return this.http.get<ResultadoPaginado<Producto>>(this.baseUrl, { params: parametros });
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  crear(producto: CrearProducto): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto);
  }

  actualizar(id: number, producto: ActualizarProducto): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto);
  }
}
