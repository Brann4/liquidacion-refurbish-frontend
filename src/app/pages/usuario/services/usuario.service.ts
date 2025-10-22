import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle } from '@/utils/ApiResponse';
import { DTOUsuario } from '../entities/DTOUsuario';
import { DTOCreateUsuario } from '../entities/DTOCreateUsuario';
import { DTOUpdateUsuario } from '../entities/DTOUpdateUsuario';


const API = environment;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpClient) {}

  list(estado? : number): Observable<DTOUsuario[]> {
    return this.http
      .get<ApiResponse<DTOUsuario>>(`${API.URL}/Usuario/${estado}`)
      .pipe(map((response) => response.value));
  }

  getById(id: number) {
    return this.http
      .get<ApiResponseSingle<DTOUsuario>>(
        `${API.URL}/Usuario/Detalle/${id}`
      )
      .pipe(map((response) => response));
  }

  create(data: DTOCreateUsuario) {
    return this.http.post<{ message: string }>(`${API.URL}/Usuario/Crear`, data);
  }

  update(data: DTOUpdateUsuario) {
    return this.http.put<{ message: string }>(`${API.URL}/Usuario/Editar`, data);
  }

  delete(id: number) {
    return this.http.delete<ApiResponseSingle<number>>(`${API.URL}/Usuario/Eliminar/${id}`);
  }
}
