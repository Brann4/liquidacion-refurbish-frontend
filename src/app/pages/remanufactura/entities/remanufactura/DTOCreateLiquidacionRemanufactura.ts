export interface DTOCreateLiquidacionRemanufactura {
  usuarioId: number;
  nombreLiquidacion: string;
  fechaIngreso:  Date | null;
  fechaCreacion: Date | null;
  estado: number;
}
