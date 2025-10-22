import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { DTOLiquidacionRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';

const API = environment;

@Injectable({
    providedIn: 'root'
})
export class RemanufacturaDetalleService {
    constructor(private http: HttpClient) {}

    list(nombre: string, estado?: number): Observable<DTOLiquidacionRemanufacturaDetalle[]> {
        return this.http.get<ApiResponse<DTOLiquidacionRemanufacturaDetalle>>(`${API.URL}/LiquidacionRemanufacturaDetalle/${estado}/${nombre}`).pipe(map((response) => response.value));
    }

    previewData(data: FormData) {
        return this.http.post<ApiResponseSingle<ImportPreviewResponse>>(`${API.URL}/LiquidacionRemanufacturaDetalle/Importacion/VistaPrevia`, data);
    }

    createDetail(data: any) {
        return this.http.post<ApiResponseSingle<ImportPreviewResponse>>(`${API.URL}/LiquidacionRemanufacturaDetalle/Importacion/Guardar`, data);
    }

    fakeDataExport(id: number) {
        return this.http.get(`${API.URL}/LiquidacionRecuperoDetalle/export/${id}`, {
            responseType: 'blob'
        });
    }
}
