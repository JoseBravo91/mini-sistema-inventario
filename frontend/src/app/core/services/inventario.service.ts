import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventarioActual } from '../models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly baseUrl = `${environment.apiUrl}/inventario`;

  constructor(private readonly http: HttpClient) {}

  obtenerInventarioActual(): Observable<InventarioActual[]> {
    return this.http.get<InventarioActual[]>(this.baseUrl);
  }
}
