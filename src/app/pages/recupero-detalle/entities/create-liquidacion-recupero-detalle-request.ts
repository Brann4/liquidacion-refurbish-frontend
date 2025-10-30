import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';

export interface CreateLiquidacionRecuperoDetalleRequest {
    liquidacionRecuperoId: number;
    detalles: LiquidacionRecuperoDetallePreviewRequest[];
}

export interface LiquidacionRecuperoDetallePreviewRequest {
    codigoSAP: string;
    descripcion: string;
    seriePrincipal: string;
    serieSecundaria: string | null;
    codigoSOT: string;
    codigoCliente: string | null;
    cliente: string | null;
    contabilizado: string | null;
    ordenCompra: string | null;
    tipoZonaId: TipoZona;
    distrito: string | null;
    fechaRecibo: string | null;
    plataforma: string | null;
}
