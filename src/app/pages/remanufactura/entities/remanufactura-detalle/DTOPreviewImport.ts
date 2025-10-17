import { DTOLiquidacionRemanufacturaDetalle } from "./DTOLiquidacionRemanufacturaDetalle";

export interface DTOPreviewImport {
  errors: string[],
  detalles: DTOLiquidacionRemanufacturaDetalle[],
  tieneErrors: boolean,
}
