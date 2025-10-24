import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';

export interface CreatePrecioZonaRequest {
    contrataId: number;
    precio: number;
    tipoZonaId: TipoZona;
    usuarioId: number;
}
