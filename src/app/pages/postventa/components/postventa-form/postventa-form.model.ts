import { FormControl } from '@angular/forms';
import { UpdateLiquidacionPostventaRequest } from '@/pages/postventa/entities/update-liquidacion-postventa-request';
import { CreateLiquidacionPostventaRequest } from '@/pages/postventa/entities/create-liquidacion-postventa-request';
import { formatISO } from 'date-fns';

export interface PostventaFormValue {
    contrataId: number | null;
    fechaIngreso: Date | null;
}

export type PostventaFormType = {
    [K in keyof PostventaFormValue]: FormControl<PostventaFormValue[K]>;
};

export const PostventaFormKeys: { [K in keyof PostventaFormValue]: K } = {
    contrataId: 'contrataId',
    fechaIngreso: 'fechaIngreso'
} as const;

export function mapPostventaFormToCreateRequest(formValue: PostventaFormValue, userId: number): CreateLiquidacionPostventaRequest {
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

export function mapPostventaFormToUpdateRequest(formValue: PostventaFormValue): UpdateLiquidacionPostventaRequest {
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
