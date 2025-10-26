import { EstadoLiquidacion } from '@/pages/recupero/entities/estado-liquidacion';

export interface LiquidacionRecuperoResponse {
    id: number;
    contrataId: number;
    fechaIngreso: string;
    estado: EstadoLiquidacion;
    usuarioId: number;
    fechaCreacion: string;
    contrata: ContrataInfo;
}

export interface ContrataInfo {
    id: number;
    ruc: string;
    razonSocial: string;
}
