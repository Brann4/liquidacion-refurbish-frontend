export interface DTOUpdateLiquidacionRemanufactura {
  id: number;
  usuarioId: number;
  nombreLiquidacion: string;
  fechaIngreso:  Date | null;
  estado: boolean;
}
