import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { BaseResponse } from '@/utils/base-response';
import { CreatePrecioZonaRequest } from '@/pages/precio-zona/entities/create-precio-zona-request';
import { UpdatePrecioZonaRequest } from '@/pages/precio-zona/entities/update-precio-zona-request';
import { PrecioZona } from '@/pages/precio-zona/entities/precio-zona';
import { handleHttpError } from '@/utils/http-error.util';

@Injectable({
    providedIn: 'root'
})
export class PrecioZonaApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/PrecioZona`;

    getByContrata(contrataId: number): Observable<BaseResponse<PrecioZona[]>> {
        return this.http.get<BaseResponse<PrecioZona[]>>(`${this.apiUrl}/contrata/${contrataId}`).pipe(catchError(handleHttpError));
    }

    getById(id: number): Observable<BaseResponse<PrecioZona>> {
        return this.http.get<BaseResponse<PrecioZona>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }

    create(request: CreatePrecioZonaRequest): Observable<BaseResponse<PrecioZona>> {
        return this.http.post<BaseResponse<PrecioZona>>(this.apiUrl, request).pipe(catchError(handleHttpError));
    }

    update(id: number, request: UpdatePrecioZonaRequest): Observable<BaseResponse<PrecioZona>> {
        return this.http.put<BaseResponse<PrecioZona>>(`${this.apiUrl}/${id}`, request).pipe(catchError(handleHttpError));
    }

    delete(id: number): Observable<BaseResponse<PrecioZona>> {
        return this.http.delete<BaseResponse<PrecioZona>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }
}
