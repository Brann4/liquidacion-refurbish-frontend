import { DTOUpdatePartidaItem } from './../entities/partidaItem/DTOUpdatePartidaItem';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { DTOPartidaItem } from '../entities/partidaItem/DTOPartidaItem';
import { DTOCreatePartidaItem } from '../entities/partidaItem/DTOCreatePartidaItem';

const API = environment;

@Injectable({
    providedIn: 'root'
})
export class PartidaDetalleService {
    constructor(private http: HttpClient) {}

    list(id: number, estado?: number): Observable<DTOPartidaItem[]> {
        return this.http.get<ApiResponse<DTOPartidaItem>>(`${API.URL}/PartidaDetalle/${estado}/${id}`).pipe(map((response) => response.value));
    }

    getById(id: number) {
        return this.http.get<ApiResponseSingle<DTOPartidaItem>>(`${API.URL}/PartidaDetalle/Detalle/${id}`).pipe(map((response) => response));
    }

    create(data: DTOCreatePartidaItem) {
        return this.http.post<ApiResponseSingle<DTOPartidaItem>>(`${API.URL}/PartidaDetalle/Crear`, data);
    }

    update(data: DTOUpdatePartidaItem) {
        return this.http.put<ApiResponseSingle<DTOPartidaItem>>(`${API.URL}/PartidaDetalle/Editar`, data);
    }

    delete(id: number) {
        return this.http.delete<ApiResponseSingle<boolean>>(`${API.URL}/PartidaDetalle/Eliminar/${id}`);
    }
}
