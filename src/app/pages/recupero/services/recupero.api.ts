import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';
import { CreateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/create-liquidacion-recupero-request';
import { UpdateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/update-liquidacion-recupero-request';
import { LiquidacionRecuperoResponse } from '@/pages/recupero/entities/liquidacion-recupero-response';
import { BaseResponse } from '@/utils/base-response';
import { environment } from '../../../../environments/environment';
import { handleHttpError } from '@/utils/http-error.util';

@Injectable({
    providedIn: 'root'
})
export class RecuperoApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRecupero`;

    getAll(): Observable<BaseResponse<LiquidacionRecuperoResponse[]>> {
        return this.http.get<BaseResponse<LiquidacionRecuperoResponse[]>>(this.apiUrl).pipe(catchError(handleHttpError));
    }

    getById(id: number): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.get<BaseResponse<LiquidacionRecupero>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }

    create(request: CreateLiquidacionRecuperoRequest): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.post<BaseResponse<LiquidacionRecupero>>(this.apiUrl, request).pipe(catchError(handleHttpError));
    }

    update(id: number, request: UpdateLiquidacionRecuperoRequest): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.put<BaseResponse<LiquidacionRecupero>>(`${this.apiUrl}/${id}`, request).pipe(catchError(handleHttpError));
    }

    delete(id: number): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.delete<BaseResponse<LiquidacionRecupero>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }
}
