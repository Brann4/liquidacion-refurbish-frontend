import { FormControl } from '@angular/forms';
import { UpdateContrataRequest } from '@/pages/contrata/entities/update-contrata-request';
import { CreateContrataRequest } from '@/pages/contrata/entities/create-contrata-request';

export interface ContrataFormValue {
    ruc: string;
    razonSocial: string;
}

export type ContrataFormType = {
    [K in keyof ContrataFormValue]: FormControl<ContrataFormValue[K]>;
};

export const ContrataFormKeys: { [K in keyof ContrataFormValue]: K } = {
    ruc: 'ruc',
    razonSocial: 'razonSocial'
} as const;

export function mapContrataFormToCreateRequest(formValue: ContrataFormValue): CreateContrataRequest {
    return {
        ruc: formValue.ruc,
        razonSocial: formValue.razonSocial
    };
}

export function mapContrataFormToUpdateRequest(formValue: ContrataFormValue): UpdateContrataRequest {
    return {
        ruc: formValue.ruc,
        razonSocial: formValue.razonSocial
    };
}
