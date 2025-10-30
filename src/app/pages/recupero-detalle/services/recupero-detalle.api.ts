import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { CreateLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/create-liquidacion-recupero-detalle-request';
import { PreviewLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/preview-liquidacion-recupero-detalle-request';
import { LiquidacionRecuperoDetallePreview } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle-preview';
import { LiquidacionRecuperoDetalle } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle';
import { environment } from '../../../../environments/environment';
import { BaseResponse } from '@/utils/base-response';
import { handleHttpError } from '@/utils/http-error.util';

const API_FILE_KEY = 'file';

@Injectable({
    providedIn: 'root'
})
export class RecuperoDetalleApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRecuperoDetalle`;

    getByRecupero(liquidacionRecuperoId: number): Observable<BaseResponse<LiquidacionRecuperoDetalle[]>> {
        return this.http.get<BaseResponse<LiquidacionRecuperoDetalle[]>>(`${this.apiUrl}/liquidacion/${liquidacionRecuperoId}`).pipe(catchError(handleHttpError));
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
}
