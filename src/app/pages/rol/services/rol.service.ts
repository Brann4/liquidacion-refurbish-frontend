import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle } from '@/utils/ApiResponse';
import { DTORol } from '../entities/DTORol';
import { DTOCreateRol } from '../entities/DTOCreateRol';
import { DTOUpdateRol } from '../entities/DTOUpdateRol';



const API = environment;

@Injectable({
  providedIn: 'root',
})
export class RolService {
  constructor(private http: HttpClient) {}

  list(estado? : number): Observable<DTORol[]> {
    return this.http
      .get<ApiResponse<DTORol>>(`${API.URL}/Rol/${estado}`)
      .pipe(map((response) => response.value));
  }

  getById(id: number) {
    return this.http
      .get<ApiResponseSingle<DTORol>>(
        `${API.URL}/Rol/Detalle/${id}`
      )
      .pipe(map((response) => response));
  }

  create(data: DTOCreateRol) {
    return this.http.post<{ message: string }>(`${API.URL}/Rol/Crear`, data);
  }

  update(data: DTOUpdateRol) {
    return this.http.put<{ message: string }>(`${API.URL}/Rol/Editar`, data);
  }

  delete(id: number) {
    return this.http.delete<ApiResponseSingle<number>>(`${API.URL}/Rol/Eliminar/${id}`);
  }
}
