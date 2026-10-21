import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movimiento, RegistrarMovimiento } from '../models/movimiento.model';
import { ResultadoPaginado } from '../models/paginado.model';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly baseUrl = `${environment.apiUrl}/movimientos`;

  constructor(private readonly http: HttpClient) {}

  registrarEntrada(movimiento: RegistrarMovimiento): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/entrada`, movimiento);
  }

  registrarSalida(movimiento: RegistrarMovimiento): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/salida`, movimiento);
  }

  obtenerHistorial(pagina: number, tamanoPagina: number, productoId?: number): Observable<ResultadoPaginado<Movimiento>> {
    const parametros: Record<string, string> = {
      pagina: pagina.toString(),
      tamanoPagina: tamanoPagina.toString(),
    };
    if (productoId) {
      parametros['productoId'] = productoId.toString();
    }

    return this.http.get<ResultadoPaginado<Movimiento>>(`${this.baseUrl}/historial`, { params: parametros });
  }
}
