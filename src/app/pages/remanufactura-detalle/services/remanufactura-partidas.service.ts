import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ApiResponseSingle } from '@/utils/ApiResponse';
import { DTOSeleccionParaResumen } from '../entities/partidas-detalle/DTOSeleccionParaResumen';


@Injectable({
    providedIn: 'root'
})
export class RemanufacturaPartidaService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.URL}/LiquidacionRemanufacturaPartida`;

    deleteMany(ids: number[]) {
        return this.http.post<ApiResponseSingle<DTOSeleccionParaResumen>>(`${this.apiUrl}/EliminarMuchos`,{ids});
    }

}
