import { EstadoLiquidacion } from '@/utils/estado-liquidacion';

export interface LiquidacionPostventaResponse {
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
