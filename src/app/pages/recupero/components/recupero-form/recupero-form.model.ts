import { FormControl } from '@angular/forms';
import { UpdateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/update-liquidacion-recupero-request';
import { CreateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/create-liquidacion-recupero-request';
import { formatISO } from 'date-fns';

export interface RecuperoFormValue {
    contrataId: number | null;
    fechaIngreso: Date | null;
}

export type RecuperoFormType = {
    [K in keyof RecuperoFormValue]: FormControl<RecuperoFormValue[K]>;
};

export const RecuperoFormKeys: { [K in keyof RecuperoFormValue]: K } = {
    contrataId: 'contrataId',
    fechaIngreso: 'fechaIngreso'
} as const;

export function mapRecuperoFormToCreateRequest(formValue: RecuperoFormValue, userId: number): CreateLiquidacionRecuperoRequest {
    if (!formValue.contrataId) {
        throw new Error('Cannot map form data: contrata is required.');
    }

    if (!formValue.fechaIngreso) {
        throw new Error('Cannot map form data: fecha de ingreso is required.');
    }

    return {
        contrataId: formValue.contrataId,
        fechaIngreso: formatISO(formValue.fechaIngreso, { representation: 'date' }),
        usuarioId: userId
    };
}

export function mapRecuperoFormToUpdateRequest(formValue: RecuperoFormValue): UpdateLiquidacionRecuperoRequest {
    if (!formValue.contrataId) {
        throw new Error('Cannot map form data: contrata is required.');
    }

    if (!formValue.fechaIngreso) {
        throw new Error('Cannot map form data: fecha de ingreso is required.');
    }

    return {
        contrataId: formValue.contrataId,
        fechaIngreso: formatISO(formValue.fechaIngreso, { representation: 'date' })
    };
}
