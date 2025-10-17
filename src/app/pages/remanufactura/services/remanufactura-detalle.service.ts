import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiResponseSingle } from '@/utils/ApiResponseSingle';
import { DTOLiquidacionRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';

const API = environment;

@Injectable({
    providedIn: 'root'
})
export class LiquidacionRemanufacturaDetalleService {
    constructor(private http: HttpClient) {}

    list(nombre: string, estado?: number): Observable<DTOLiquidacionRemanufacturaDetalle[]> {
        return this.http.get<ApiResponse<DTOLiquidacionRemanufacturaDetalle>>(`${API.URL}/LiquidacionRemanufacturaDetalle/${estado}/${nombre}`).pipe(map((response) => response.value));
    }

    getById(id: number) {
        return this.http.get<ApiResponseSingle<DTOLiquidacionRemanufacturaDetalle>>(`${API.URL}/LiquidacionRemanufacturaDetalle/Detalle/${id}`).pipe(map((response) => response));
    }

    delete(id: number, nombre: string) {
        return this.http.delete<ApiResponseSingle<number>>(`${API.URL}/LiquidacionRemanufacturaDetalle/Eliminar/${id}/${nombre}`);
    }
}
