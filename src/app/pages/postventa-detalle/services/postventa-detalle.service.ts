import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponse, ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { BaseResponse } from '@/utils/base-response';
import { DTOLiquidacionRemanufacturaDetalle } from '@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { DTOCreatePostVentaDetalle } from '../entities/postventa-detalle/DTOCreatePostVentaDetalle';

@Injectable({
    providedIn: 'root'
})
export class PostVentaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/PostVentaDetalle`;

    list(nombre: number, estado?: number): Observable<BaseResponse<DTOLiquidacionRemanufacturaDetalle[]>> {
        return this.http.get<BaseResponse<DTOLiquidacionRemanufacturaDetalle[]>>(`${this.apiUrl}/${estado}/${nombre}`);
    }

    create(data: DTOCreatePostVentaDetalle) {
        return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/GuardarDetalle`, data);
    }

    exportDataTable(nombreLiquidacion: string | undefined): Observable<HttpResponse<Blob>> {
        const query = `${this.apiUrl}/Exportar/${nombreLiquidacion}`;
        return this.http.get(query, { observe: 'response', responseType: 'blob' });
    }

    deleteMany(ids: number[]) {
        return this.http.post<ApiResponseSingle<number>>(`${this.apiUrl}/EliminarMuchos`,{ids});
    }

    deleteAll(idLiquidacion: number) {
        return this.http.delete<ApiResponseSingle<number>>(`${this.apiUrl}/EliminarTodo/${idLiquidacion}`);
    }


}
