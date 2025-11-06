import { DTOPostVentaDetalle } from "./DTOPostVentaDetalle";

export interface DTOPreviewImport {
  errors: string[],
  detalles: DTOPostVentaDetalle[],
  tieneErrors: boolean,
}
