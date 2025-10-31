export interface DTOLiquidacionRemanufactura {
  id: number;
  usuarioId: number;
  nombreLiquidacion: string;
  fechaIngreso: Date | null;
  fechaCreacion?:  Date | null;
  estado: boolean;
}
