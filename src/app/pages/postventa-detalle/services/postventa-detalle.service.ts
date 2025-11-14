import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseResponse } from '@/utils/base-response';
import { DTOCreatePostVentaDetalle } from '../entities/postventa-detalle/DTOCreatePostVentaDetalle';
import { DTOLiquidacionPostVentaDetalle } from '../entities/postventa-detalle/DTOPostVentaDetalle';
import { DeleteLiquidacionPostventaDetalleByIdsRequest } from '@/pages/postventa-detalle/entities/delete-liquidacion-postventa-detalle-by-ids-request';
import { handleHttpError } from '@/utils/http-error.util';
import { PaginatedData } from '@/utils/paginated-data';

@Injectable({
    providedIn: 'root'
})
export class PostVentaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionPostventaDetalle`;

    list(liquidacionPostventaId: number, page: number = 1, pageSize: number = 10, searchFilter?: string): Observable<BaseResponse<PaginatedData<DTOLiquidacionPostVentaDetalle>>> {
        let params = `?page=${page}&pageSize=${pageSize}`;
        if (searchFilter && searchFilter.trim()) {
            params += `&searchFilter=${encodeURIComponent(searchFilter)}`;
        }
        return this.http.get<BaseResponse<PaginatedData<DTOLiquidacionPostVentaDetalle>>>(`${this.apiUrl}/liquidacion/${liquidacionPostventaId}${params}`).pipe(catchError(handleHttpError));
    }

    create(data: DTOCreatePostVentaDetalle): Observable<BaseResponse<DTOLiquidacionPostVentaDetalle[]>> {
        return this.http.post<BaseResponse<DTOLiquidacionPostVentaDetalle[]>>(`${this.apiUrl}/Importacion/Guardar`, data);
    }

    export(liquidacionPostventaId: number): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.apiUrl}/export/${liquidacionPostventaId}`, { observe: 'response', responseType: 'blob' });
    }

    deleteByLiquidacionPostventaId(liquidacionPostventaId: number): Observable<BaseResponse<boolean>> {
        return this.http.delete<BaseResponse<boolean>>(`${this.apiUrl}/liquidacion/${liquidacionPostventaId}`).pipe(catchError(handleHttpError));
    }

    deleteByIds(request: DeleteLiquidacionPostventaDetalleByIdsRequest): Observable<BaseResponse<boolean>> {
        return this.http.delete<BaseResponse<boolean>>(`${this.apiUrl}/ids`, { body: request }).pipe(catchError(handleHttpError));
    }
}
