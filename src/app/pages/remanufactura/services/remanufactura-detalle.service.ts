import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { DTOLiquidacionRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { BaseResponse } from '@/utils/base-response';

@Injectable({
    providedIn: 'root'
})
export class RemanufacturaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRemanufacturaDetalle`;

    list(nombre: string, estado?: number): Observable<BaseResponse<DTOLiquidacionRemanufacturaDetalle[]>> {
        return this.http.get<BaseResponse<DTOLiquidacionRemanufacturaDetalle[]>>(`${this.apiUrl}/${estado}/${nombre}`);
    }

    previewData(data: FormData) {
        return this.http.post<ApiResponseSingle<ImportPreviewResponse>>(`${this.apiUrl}/Importacion/VistaPrevia`, data);
    }

    createDetail(data: DTOLiquidacionRemanufacturaDetalle) {
        return this.http.post<ApiResponse<ImportPreviewResponse>>(`${this.apiUrl}/Importacion/Guardar`, data);
    }

    exportDataTable(nombreLiquidacion: string | undefined): Observable<HttpResponse<Blob>> {
        const query = `${this.apiUrl}/Exportar/${nombreLiquidacion}`;
        return this.http.get(query, { observe: 'response', responseType: 'blob' });
    }
}
