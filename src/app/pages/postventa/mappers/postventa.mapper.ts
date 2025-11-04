import { LiquidacionPostventa } from '@/pages/postventa/entities/liquidacion-postventa';
import { LiquidacionPostventaResponse } from '@/pages/postventa/entities/liquidacion-postventa-response';

export function mapResponseToLiquidacionPostventa(response: LiquidacionPostventaResponse): LiquidacionPostventa {
    return {
        id: response.id,
        contrataId: response.contrataId,
        fechaIngreso: response.fechaIngreso,
        estado: response.estado,
        usuarioId: response.usuarioId,
        fechaCreacion: response.fechaCreacion
    };
}
