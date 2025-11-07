import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponseSingle } from '@/utils/ApiResponse';
import { BaseResponse } from '@/utils/base-response';
import { DTOLiquidacionRemanufacturaDetalle } from '@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { DTOCreatePostVentaDetalle } from '../entities/postventa-detalle/DTOCreatePostVentaDetalle';
import { DTOLiquidacionPostVentaDetalle } from '../entities/postventa-detalle/DTOPostVentaDetalle';

@Injectable({
    providedIn: 'root'
})
export class PostVentaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionPostVentaDetalle`;

    list(idLiquidacion?: number): Observable<BaseResponse<DTOLiquidacionPostVentaDetalle[]>> {
        return this.http.get<BaseResponse<DTOLiquidacionPostVentaDetalle[]>>(`${this.apiUrl}/${idLiquidacion}`);
    }

    create(data: DTOCreatePostVentaDetalle): Observable<BaseResponse<DTOLiquidacionPostVentaDetalle[]>> {
        return this.http.post<BaseResponse<DTOLiquidacionPostVentaDetalle[]>>(`${this.apiUrl}/Importacion/Guardar`, data);
    }

    export(liquidacionPostventaId: number): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.apiUrl}/export/${liquidacionPostventaId}`, { observe: 'response', responseType: 'blob' });
    }

    deleteMany(ids: number[]) {
        return this.http.post<ApiResponseSingle<number>>(`${this.apiUrl}/EliminarMuchos`, { ids });
    }

    deleteAll(idLiquidacion: number) {
        return this.http.delete<ApiResponseSingle<number>>(`${this.apiUrl}/EliminarTodo/${idLiquidacion}`);
    }
}
