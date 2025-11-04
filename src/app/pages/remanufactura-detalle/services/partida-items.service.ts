import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { BaseResponse } from '@/utils/base-response';
import { DTOPartidaConItem } from '@/pages/remanufactura-detalle/entities/partidas-detalle/DTOPartidaConItem';
import { Observable } from 'rxjs';
import { DTOCreatePartidasSeleccionadas } from '../entities/partidas-detalle/DTOCreatePartidasSeleccionadas';
import { DTOPartidaSeleccionada } from '../entities/partidas-detalle/DTOPartidaSeleccionada';

@Injectable({
    providedIn: 'root'
})
export class PartidaRemanufacturaDetalleService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRemanufacturaPartida`;

    loadPartidasItems(): Observable<BaseResponse<DTOPartidaConItem[]>> {
        return this.http.get<BaseResponse<DTOPartidaConItem[]>>(`${this.apiUrl}/ObtenerDetalle`);
    }

    saveSelections(data: DTOCreatePartidasSeleccionadas) {
        return this.http.post<BaseResponse<number>>(`${this.apiUrl}/GuardarDetalle`, data);
    }

    loadSelections(detalleId: number): Observable<BaseResponse<DTOPartidaSeleccionada[]>> {
        return this.http.get<BaseResponse<DTOPartidaSeleccionada[]>>(`${this.apiUrl}/ObtenerSelecciones/${detalleId}`);
    }
}
