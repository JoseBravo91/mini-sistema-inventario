import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface RespuestaCloudinary {
  secure_url: string;
}

// Sube imagenes de producto directo a Cloudinary (unsigned upload preset), sin pasar por el backend
@Injectable({ providedIn: 'root' })
export class CloudinarioService {
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

  constructor(private readonly http: HttpClient) {}

  subirImagen(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);

    return this.http
      .post<RespuestaCloudinary>(this.uploadUrl, formData)
      .pipe(map((respuesta) => respuesta.secure_url));
  }
}
