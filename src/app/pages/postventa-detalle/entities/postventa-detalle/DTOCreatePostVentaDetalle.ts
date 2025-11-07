export interface DTOCreatePostVentaDetalle {
    liquidacionPostventaId: number;
    detalles: LiquidacionPostVentaDetallePreviewRequest[];
}

export interface LiquidacionPostVentaDetallePreviewRequest {
    fechaCarga: Date | string | null;
    tipoLiquidacion: string;
    codigoSAP: string;
    contratista: string;
    departamento: string;
    codigoSOT: string;
    fechaInstalacion: Date | string | null;
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
