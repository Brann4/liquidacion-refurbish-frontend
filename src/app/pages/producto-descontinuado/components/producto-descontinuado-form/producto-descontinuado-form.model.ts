import { FormControl } from '@angular/forms';
import { UpdateProductoDescontinuadoRequest } from '@/pages/producto-descontinuado/entities/update-producto-descontinuado-request';
import { CreateProductoDescontinuadoRequest } from '@/pages/producto-descontinuado/entities/create-producto-descontinuado-request';
import { formatISO } from 'date-fns';

export interface ProductoDescontinuadoFormValue {
    codigoSAP: string;
    nombreProducto: string;
    fechaDescontinuado: Date | null;
    estado: boolean;
}

export type ProductoDescontinuadoFormType = {
    [K in keyof ProductoDescontinuadoFormValue]: FormControl<ProductoDescontinuadoFormValue[K]>;
};

export const ProductoDescontinuadoFormKeys: { [K in keyof ProductoDescontinuadoFormValue]: K } = {
    codigoSAP: 'codigoSAP',
    nombreProducto: 'nombreProducto',
    fechaDescontinuado: 'fechaDescontinuado',
    estado: 'estado'
} as const;

export function mapProductoDescontinuadoFormToCreateRequest(formValue: ProductoDescontinuadoFormValue, userId: number): CreateProductoDescontinuadoRequest {
    if (!formValue.fechaDescontinuado) {
        throw new Error('Cannot map form data: discontinuation date is required.');
    }

    return {
        codigoSAP: formValue.codigoSAP,
        nombreProducto: formValue.nombreProducto,
        fechaDescontinuado: formatISO(formValue.fechaDescontinuado, { representation: 'date' }),
        estado: formValue.estado,
        usuarioId: userId
    };
}

export function mapProductoDescontinuadoFormToUpdateRequest(formValue: ProductoDescontinuadoFormValue): UpdateProductoDescontinuadoRequest {
    if (!formValue.fechaDescontinuado) {
        throw new Error('Cannot map form data: discontinuation date is required.');
    }

    return {
        codigoSAP: formValue.codigoSAP,
        nombreProducto: formValue.nombreProducto,
        fechaDescontinuado: formatISO(formValue.fechaDescontinuado, { representation: 'date' }),
        estado: formValue.estado
    };
}
