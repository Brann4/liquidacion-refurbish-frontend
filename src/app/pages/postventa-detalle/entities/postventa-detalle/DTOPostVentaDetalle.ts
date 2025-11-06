export interface DTOLiquidacionPostVentaDetalle {
    id: number;
    liquidacionPostVentaId: number;
    fechaCarga: Date;
    tipoLiquidacion: string;
    codigoSAP: string;
    contratista: string;
    departamento: string;
    codigoSOT: string;
    fechaInstalacion: Date;
    codigoActividad: string;
    actividadDescripcion: string;
    cantidad: number;
    costo: number;
    total: number;
    tipoTrabajo: string;
    servicio: string;
    ordenCompra: string;
    mesPago: string;
}
