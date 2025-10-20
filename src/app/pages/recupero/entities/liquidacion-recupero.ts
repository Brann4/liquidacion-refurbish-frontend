import { EstadoLiquidacion } from '@/pages/recupero/entities/estado-liquidacion';

export interface LiquidacionRecupero {
    id: number;
    contrataId: number;
    fechaIngreso: Date;
    estado: EstadoLiquidacion;
    usuarioId: number;
    fechaCreacion: Date;
}
