import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { DTOLiquidacionRemanufactura } from '../entities/remanufactura/DTOLiquidacionRemanufactura';
import { DTOCreateLiquidacionRemanufactura } from '../entities/remanufactura/DTOCreateLiquidacionRemanufactura';
import { DTOUpdateLiquidacionRemanufactura } from '../entities/remanufactura/DTOUpdateLiquidacionRemanufactura';
import { ApiResponse, ApiResponseSingle } from '@/utils/ApiResponse';


const API = environment;

@Injectable({
  providedIn: 'root',
})
export class LiquidacionRemanufacturaService {
  constructor(private http: HttpClient) {}

  list(estado? : number): Observable<DTOLiquidacionRemanufactura[]> {
    return this.http
      .get<ApiResponse<DTOLiquidacionRemanufactura>>(`${API.URL}/LiquidacionRemanufactura/${estado}`)
      .pipe(map((response) => response.value));
  }

  getById(id: number) {
    return this.http
      .get<ApiResponseSingle<DTOLiquidacionRemanufactura>>(
        `${API.URL}/LiquidacionRemanufactura/Detalle/${id}`
      )
      .pipe(map((response) => response));
  }

  create(data: DTOCreateLiquidacionRemanufactura) {
    return this.http.post<ApiResponseSingle<DTOLiquidacionRemanufactura>>(`${API.URL}/LiquidacionRemanufactura/Crear`, data);
  }

  update(data: DTOUpdateLiquidacionRemanufactura) {
    return this.http.put<{ message: string }>(`${API.URL}/LiquidacionRemanufactura/Editar`, data);
  }

  delete(id: number, nombre: string) {
    return this.http.delete<ApiResponseSingle<number>>(`${API.URL}/LiquidacionRemanufactura/Eliminar/${id}/${nombre}`);
  }
}
