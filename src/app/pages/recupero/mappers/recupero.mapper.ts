import { LiquidacionRecuperoResponse } from '@/pages/recupero/entities/liquidacion-recupero-response';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';

export function mapResponseToLiquidacionRecupero(response: LiquidacionRecuperoResponse): LiquidacionRecupero {
    return {
        id: response.id,
        contrataId: response.contrataId,
        fechaIngreso: response.fechaIngreso,
        estado: response.estado,
        usuarioId: response.usuarioId,
        fechaCreacion: response.fechaCreacion
    };
}

export function mapResponseListToLiquidacionRecuperoList(responses: LiquidacionRecuperoResponse[]): LiquidacionRecupero[] {
    return responses.map(mapResponseToLiquidacionRecupero);
}
