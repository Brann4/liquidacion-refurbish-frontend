import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';

export interface UpdatePrecioZonaRequest {
    contrataId: number;
    precio: number;
    tipoZonaId: TipoZona;
}
