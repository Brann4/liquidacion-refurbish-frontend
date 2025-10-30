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
  serieOrigen: string | null,
  serieFinal: string,
  trabajoRealizado: string,
  estado:string,
  componentes: string,
  costoUnitario: number,
  costoTotal: number,
  motivoEntrega: string,
  guiaIngreso: string | null,
  guiaSalida: string,
  estadoSAP: string,
  ordenDeCompra: string | null,
  contabilizado: string,
  pedido: string,
  reingreso: number
};
