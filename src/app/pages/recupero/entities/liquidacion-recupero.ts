import { EstadoLiquidacion } from '@/utils/estado-liquidacion';

export interface LiquidacionRecupero {
    id: number;
    contrataId: number;
    fechaIngreso: string;
    estado: EstadoLiquidacion;
    usuarioId: number;
    fechaCreacion: string;
}
