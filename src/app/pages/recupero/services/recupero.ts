import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';
import { CreateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/create-liquidacion-recupero-request';
import { UpdateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/update-liquidacion-recupero-request';
import { BaseResponse } from '@/utils/base-response';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Recupero {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRecupero`;

    private handleResponse<T>(response: BaseResponse<T>): BaseResponse<T> {
        if (response.status && response.value) {
            return response;
        } else {
            throw new Error(response.msg || 'Ocurrió un error en la API');
        }
    }

    getAll(): Observable<BaseResponse<LiquidacionRecupero[]>> {
        return this.http.get<BaseResponse<LiquidacionRecupero[]>>(this.apiUrl).pipe(map(this.handleResponse));
    }

    getById(id: number): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.get<BaseResponse<LiquidacionRecupero>>(`${this.apiUrl}/${id}`).pipe(map(this.handleResponse));
    }

    create(request: CreateLiquidacionRecuperoRequest): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.post<BaseResponse<LiquidacionRecupero>>(this.apiUrl, request).pipe(map(this.handleResponse));
    }

    update(id: number, request: UpdateLiquidacionRecuperoRequest): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.put<BaseResponse<LiquidacionRecupero>>(`${this.apiUrl}/${id}`, request).pipe(map(this.handleResponse));
    }

    delete(id: number): Observable<BaseResponse<LiquidacionRecupero>> {
        return this.http.delete<BaseResponse<LiquidacionRecupero>>(`${this.apiUrl}/${id}`).pipe(map(this.handleResponse));
    }
}
