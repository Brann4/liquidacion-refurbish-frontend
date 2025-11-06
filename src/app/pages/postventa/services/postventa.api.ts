import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { LiquidacionPostventa } from '@/pages/postventa/entities/liquidacion-postventa';
import { CreateLiquidacionPostventaRequest } from '@/pages/postventa/entities/create-liquidacion-postventa-request';
import { UpdateLiquidacionPostventaRequest } from '@/pages/postventa/entities/update-liquidacion-postventa-request';
import { LiquidacionPostventaResponse } from '@/pages/postventa/entities/liquidacion-postventa-response';
import { BaseResponse } from '@/utils/base-response';
import { environment } from '../../../../environments/environment';
import { handleHttpError } from '@/utils/http-error.util';

@Injectable({
    providedIn: 'root'
})
export class PostventaApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionPostventa`;

    getAll(): Observable<BaseResponse<LiquidacionPostventaResponse[]>> {
        return this.http.get<BaseResponse<LiquidacionPostventaResponse[]>>(this.apiUrl).pipe(catchError(handleHttpError));
    }

    getById(id: number): Observable<BaseResponse<LiquidacionPostventa>> {
        return this.http.get<BaseResponse<LiquidacionPostventa>>(`${this.apiUrl}/${id}`);
    }

    create(request: CreateLiquidacionPostventaRequest): Observable<BaseResponse<LiquidacionPostventa>> {
        return this.http.post<BaseResponse<LiquidacionPostventa>>(this.apiUrl, request).pipe(catchError(handleHttpError));
    }

    update(id: number, request: UpdateLiquidacionPostventaRequest): Observable<BaseResponse<LiquidacionPostventa>> {
        return this.http.put<BaseResponse<LiquidacionPostventa>>(`${this.apiUrl}/${id}`, request).pipe(catchError(handleHttpError));
    }

    delete(id: number): Observable<BaseResponse<LiquidacionPostventa>> {
        return this.http.delete<BaseResponse<LiquidacionPostventa>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }
}
