import { FormControl } from '@angular/forms';
import { UpdatePrecioZonaRequest } from '@/pages/precio-zona/entities/update-precio-zona-request';
import { CreatePrecioZonaRequest } from '@/pages/precio-zona/entities/create-precio-zona-request';
import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';

export interface PrecioZonaFormValue {
    precio: number;
    tipoZonaId: TipoZona;
}

export type PrecioZonaFormType = {
    [K in keyof PrecioZonaFormValue]: FormControl<PrecioZonaFormValue[K]>;
};

export const PrecioZonaFormKeys: { [K in keyof PrecioZonaFormValue]: K } = {
    precio: 'precio',
    tipoZonaId: 'tipoZonaId'
} as const;

export function mapPrecioZonaFormToCreateRequest(formValue: PrecioZonaFormValue, contrataId: number, usuarioId: number): CreatePrecioZonaRequest {
    return {
        contrataId: contrataId,
        precio: formValue.precio,
        tipoZonaId: formValue.tipoZonaId,
        usuarioId: usuarioId
    };
}

export function mapPrecioZonaFormToUpdateRequest(formValue: PrecioZonaFormValue, contrataId: number): UpdatePrecioZonaRequest {
    return {
        contrataId: contrataId,
        precio: formValue.precio,
        tipoZonaId: formValue.tipoZonaId
    };
}

export const TipoZonaOptions = [
    { label: 'Lima Metropolitana', value: TipoZona.LimaMetropolitana },
    { label: 'Provincias', value: TipoZona.Provincias }
];
