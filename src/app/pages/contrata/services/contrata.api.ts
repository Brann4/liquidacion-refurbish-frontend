import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { CreateContrataRequest } from '@/pages/contrata/entities/create-contrata-request';
import { UpdateContrataRequest } from '@/pages/contrata/entities/update-contrata-request';
import { handleHttpError } from '@/utils/http-error.util';
import { BaseResponse } from '@/utils/base-response';

@Injectable({
    providedIn: 'root'
})
export class ContrataApi {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/Contrata`;

    getAll(): Observable<BaseResponse<Contrata[]>> {
        return this.http.get<BaseResponse<Contrata[]>>(this.apiUrl).pipe(catchError(handleHttpError));
    }

    getById(id: number): Observable<BaseResponse<Contrata>> {
        return this.http.get<BaseResponse<Contrata>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }

    create(request: CreateContrataRequest): Observable<BaseResponse<Contrata>> {
        return this.http.post<BaseResponse<Contrata>>(this.apiUrl, request).pipe(catchError(handleHttpError));
    }

    update(id: number, request: UpdateContrataRequest): Observable<BaseResponse<Contrata>> {
        return this.http.put<BaseResponse<Contrata>>(`${this.apiUrl}/${id}`, request).pipe(catchError(handleHttpError));
    }

    delete(id: number): Observable<BaseResponse<Contrata>> {
        return this.http.delete<BaseResponse<Contrata>>(`${this.apiUrl}/${id}`).pipe(catchError(handleHttpError));
    }
}
