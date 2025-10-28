import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle } from '@/utils/ApiResponse';
import { DTOPartida } from '../entities/partida/DTOPartida';
import { DTOCreatePartida } from '../entities/partida/DTOCreatePartida';
import { DTOUpdatePartida } from '../entities/partida/DTOUpdatePartida';


const API = environment;

@Injectable({
  providedIn: 'root',
})
export class PartidaService {
  constructor(private http: HttpClient) {}

  list(estado? : number): Observable<DTOPartida[]> {
    return this.http
      .get<ApiResponse<DTOPartida>>(`${API.URL}/Partida/${estado}`)
      .pipe(map((response) => response.value));
  }

  getById(id: number) {
    return this.http
      .get<ApiResponseSingle<DTOPartida>>(
        `${API.URL}/Partida/Detalle/${id}`
      )
      .pipe(map((response) => response));
  }

  create(data: DTOCreatePartida) {
    return this.http.post<ApiResponseSingle<DTOPartida>>(`${API.URL}/Partida/Crear`, data);
  }

  update(data: DTOUpdatePartida) {
    return this.http.put<{ message: string }>(`${API.URL}/Partida/Editar`, data);
  }

  delete(id: number) {
    return this.http.delete<ApiResponseSingle<number>>(`${API.URL}/Partida/Eliminar/${id}`);
  }
}
