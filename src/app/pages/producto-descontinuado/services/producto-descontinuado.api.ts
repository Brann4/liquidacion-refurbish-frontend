import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { BaseResponse } from '@/utils/base-response';
import { CreateProductoDescontinuadoRequest } from '@/pages/producto-descontinuado/entities/create-producto-descontinuado-request';
import { UpdateProductoDescontinuadoRequest } from '@/pages/producto-descontinuado/entities/update-producto-descontinuado-request';
import { ProductoDescontinuado } from '@/pages/producto-descontinuado/entities/producto-descontinuado';
import { handleHttpError } from '@/utils/http-error.util';

@Injectable({
    providedIn: 'root'
})
export class ProductoDescontinuadoApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/ProductoDescontinuado`;

    getAll(): Observable<BaseResponse<ProductoDescontinuado[]>> {
        return this.http.get<BaseResponse<ProductoDescontinuado[]>>(this.apiUrl).pipe(catchError(handleHttpError));
    }

    getById(id: number): Observable<BaseResponse<ProductoDescontinuado>> {
        return this.http.get<BaseResponse<ProductoDescontinuado>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }

    create(request: CreateProductoDescontinuadoRequest): Observable<BaseResponse<ProductoDescontinuado>> {
        return this.http.post<BaseResponse<ProductoDescontinuado>>(this.apiUrl, request).pipe(catchError(handleHttpError));
    }

    update(id: number, request: UpdateProductoDescontinuadoRequest): Observable<BaseResponse<ProductoDescontinuado>> {
        return this.http.put<BaseResponse<ProductoDescontinuado>>(`${this.apiUrl}/${id}`, request).pipe(catchError(handleHttpError));
    }

    delete(id: number): Observable<BaseResponse<ProductoDescontinuado>> {
        return this.http.delete<BaseResponse<ProductoDescontinuado>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }
}
