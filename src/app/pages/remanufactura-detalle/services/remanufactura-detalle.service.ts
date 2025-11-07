import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { BaseResponse } from '@/utils/base-response';
import { DTOLiquidacionRemanufacturaDetalle } from '@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { DTOCreateRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOCreateRemanufacturaDetalle';

@Injectable({
    providedIn: 'root'
})
export class RemanufacturaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRemanufacturaDetalle`;

    list(idLiquidacion: number, estado?: number): Observable<BaseResponse<DTOLiquidacionRemanufacturaDetalle[]>> {
        return this.http.get<BaseResponse<DTOLiquidacionRemanufacturaDetalle[]>>(`${this.apiUrl}/${estado}/${idLiquidacion}`);
    }

    previewData(data: FormData) {
        return this.http.post<ApiResponseSingle<ImportPreviewResponse>>(`${this.apiUrl}/Importacion/VistaPrevia`, data);
    }

    create(data: DTOCreateRemanufacturaDetalle) {
        return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/Importacion/Guardar`, data);
    }

    export(idLiquidacion: number): Observable<HttpResponse<Blob>> {
        const query = `${this.apiUrl}/Exportar/${idLiquidacion}`;
        return this.http.get(query, { observe: 'response', responseType: 'blob' });
    }

    deleteMany(ids: number[]) {
        return this.http.post<ApiResponseSingle<number>>(`${this.apiUrl}/EliminarMuchos`,{ids});
    }

    deleteAll(idLiquidacion: number) {
        return this.http.delete<ApiResponseSingle<number>>(`${this.apiUrl}/EliminarTodo/${idLiquidacion}`);
    }


}
