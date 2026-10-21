import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarUsuario, CrearUsuario, Usuario } from '../models/usuario.model';
import { ResultadoPaginado } from '../models/paginado.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  listar(pagina: number, tamanoPagina: number, busqueda?: string): Observable<ResultadoPaginado<Usuario>> {
    const parametros: Record<string, string> = {
      pagina: pagina.toString(),
      tamanoPagina: tamanoPagina.toString(),
    };
    if (busqueda) {
      parametros['busqueda'] = busqueda;
    }

    return this.http.get<ResultadoPaginado<Usuario>>(this.baseUrl, { params: parametros });
  }

  crear(usuario: CrearUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  actualizar(id: number, usuario: ActualizarUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }
}
