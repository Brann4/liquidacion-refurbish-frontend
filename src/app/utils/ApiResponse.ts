import { DTOLiquidacionRemanufacturaDetalle } from "@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle";

export interface ApiResponse<T> {
  status: boolean;
  msg: string;
  value: T[];
}


export interface ApiResponseSingle<T> {
  status: boolean;
  msg: string;
  value: T;
}

export interface ImportPreviewResponse {
    errors: string[],
    detalles: DTOLiquidacionRemanufacturaDetalle[]
    tieneErrores: boolean

}
