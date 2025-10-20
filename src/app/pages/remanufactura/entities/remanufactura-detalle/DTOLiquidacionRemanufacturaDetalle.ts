export interface DTOLiquidacionRemanufacturaDetalle {
  codigoLiquidacion: string;
  plataforma: string
  liquidacion: string,
  codigoEntrega: string,
  fechaPrevista: Date | string | null,
  codigoSAP: string,
  nombreProducto: string,
  cantidad: number,
  unidadMedida: string,
  serieOrigen: string,
  serieFinal: string,
  trabajoRealizado: string,
  estado:string,
  componentes: string,
  costoUnitario: number,
  costoTotal: number,
  motivoEntrega: string,
  guiaIngreso: string,
  guiaSalida: string,
  estadoSAP: string,
  ordenDeCompra: string,
  contabilizado: string,
  pedido: string,
  reingreso: number
};
