import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { CreateLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/create-liquidacion-recupero-detalle-request';
import { PreviewLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/preview-liquidacion-recupero-detalle-request';
import { DeleteLiquidacionRecuperoDetalleByIdsRequest } from '@/pages/recupero-detalle/entities/delete-liquidacion-recupero-detalle-by-ids-request';
import { LiquidacionRecuperoDetallePreview } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle-preview';
import { LiquidacionRecuperoDetalle } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle';
import { environment } from '../../../../environments/environment';
import { BaseResponse } from '@/utils/base-response';
import { handleHttpError } from '@/utils/http-error.util';
import { PaginatedData } from '@/utils/paginated-data';

const API_FILE_KEY = 'file';

@Injectable({
    providedIn: 'root'
})
export class RecuperoDetalleApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRecuperoDetalle`;

    getByRecupero(liquidacionRecuperoId: number, page: number = 1, pageSize: number = 10): Observable<BaseResponse<PaginatedData<LiquidacionRecuperoDetalle>>> {
        const params = `?page=${page}&pageSize=${pageSize}`;
        return this.http.get<BaseResponse<PaginatedData<LiquidacionRecuperoDetalle>>>(`${this.apiUrl}/liquidacion/${liquidacionRecuperoId}${params}`).pipe(catchError(handleHttpError));
    }

    create(request: CreateLiquidacionRecuperoDetalleRequest): Observable<BaseResponse<boolean>> {
        return this.http.post<BaseResponse<boolean>>(this.apiUrl, request).pipe(catchError(handleHttpError));
    }

    preview(request: PreviewLiquidacionRecuperoDetalleRequest): Observable<BaseResponse<LiquidacionRecuperoDetallePreview[]>> {
        const formData = new FormData();
        formData.append(API_FILE_KEY, request.file, request.file.name);
        return this.http.post<BaseResponse<LiquidacionRecuperoDetallePreview[]>>(`${this.apiUrl}/preview`, formData).pipe(catchError(handleHttpError));
    }

    export(liquidacionRecuperoId: number): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.apiUrl}/export/${liquidacionRecuperoId}`, { observe: 'response', responseType: 'blob' }).pipe(catchError(handleHttpError));
    }

    deleteByLiquidacionRecuperoId(liquidacionRecuperoId: number): Observable<BaseResponse<boolean>> {
        return this.http.delete<BaseResponse<boolean>>(`${this.apiUrl}/liquidacion/${liquidacionRecuperoId}`).pipe(catchError(handleHttpError));
    }

    deleteByIds(request: DeleteLiquidacionRecuperoDetalleByIdsRequest): Observable<BaseResponse<boolean>> {
        return this.http.delete<BaseResponse<boolean>>(`${this.apiUrl}/ids`, { body: request }).pipe(catchError(handleHttpError));
    }
}
