import { DTOUpdatePartidaItem } from './../entities/partidaItem/DTOUpdatePartidaItem';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponseSingle } from '@/utils/ApiResponse';
import { DTOPartidaItem } from '../entities/partidaItem/DTOPartidaItem';
import { DTOCreatePartidaItem } from '../entities/partidaItem/DTOCreatePartidaItem';
import { BaseResponse } from '@/utils/base-response';

const API = environment;

@Injectable({
    providedIn: 'root'
})
export class PartidaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/PartidaDetalle`;

    list(id: number, estado?: number): Observable<BaseResponse<DTOPartidaItem[]>> {
        return this.http.get<BaseResponse<DTOPartidaItem[]>>(`${this.apiUrl}/${estado}/${id}`);
    }

    getById(id: number) {
        return this.http.get<ApiResponseSingle<DTOPartidaItem>>(`${this.apiUrl}/Detalle/${id}`).pipe(map((response) => response));
    }

    create(data: DTOCreatePartidaItem) {
        return this.http.post<ApiResponseSingle<DTOPartidaItem>>(`${this.apiUrl}/Crear`, data);
    }

    update(data: DTOUpdatePartidaItem) {
        return this.http.put<ApiResponseSingle<DTOPartidaItem>>(`${this.apiUrl}/Editar`, data);
    }

    delete(id: number) {
        return this.http.delete<ApiResponseSingle<boolean>>(`${this.apiUrl}/Eliminar/${id}`);
    }
}
