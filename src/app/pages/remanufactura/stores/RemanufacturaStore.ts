import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DTOLiquidacionRemanufactura } from '../entities/remanufactura/DTOLiquidacionRemanufactura';
import { DTOUpdateLiquidacionRemanufactura } from '../entities/remanufactura/DTOUpdateLiquidacionRemanufactura';
import { DTOCreateLiquidacionRemanufactura } from '../entities/remanufactura/DTOCreateLiquidacionRemanufactura';
import { LiquidacionRemanufacturaService } from '../services/remanufactura.service';
import { Estado } from '@/utils/Constants';
import { ToastService } from '@/layout/service/toast.service';

export enum Eliminar {
    Correcto = 1,
    Advertencia = 2
}

export type RemanufacturaState = {
    entities: DTOLiquidacionRemanufactura[];
    entity: DTOLiquidacionRemanufactura | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    entityEdit: DTOUpdateLiquidacionRemanufactura | null;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entities: [],
    entityEdit: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const RemanufacturaStore = signalStore(
    { providedIn: 'root' },
    withState<RemanufacturaState>(initialState),
    withMethods((store, remanufacturaService = inject(LiquidacionRemanufacturaService), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },
        openModalEdit(entity: DTOLiquidacionRemanufactura) {
            patchState(store, { entityEdit: entity, isOpenEdit: true });
        },
        closeModalCreate() {
            patchState(store, { isOpenCreate: false });
        },
        closeModalEdit() {
            patchState(store, { isOpenEdit: false, entityEdit: null });
        },
        setSubmitting(isSubmitting: boolean) {
            patchState(store, { isSubmitting });
        },

        getLiquidaciones(status?: number) {
            remanufacturaService.list(status).subscribe({
                next: (entities) => {
                    patchState(store, { entities });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: true, error: error.message });
                }
            });
        },

        create(data: DTOCreateLiquidacionRemanufactura) {
            patchState(store, { isSubmitting: true });

            remanufacturaService.create(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Liquidación agreda correctamente.');
                    this.getLiquidaciones(Estado.Todos);
                    this.closeModalCreate();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: true, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        update(data: DTOUpdateLiquidacionRemanufactura) {
            patchState(store, { isSubmitting: true });

            remanufacturaService.update(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Liquidación actualizada correctamente.');
                    this.getLiquidaciones(Estado.Todos);
                    this.closeModalEdit();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        delete(id: number, nombre: string) {
            remanufacturaService.delete(id, nombre).subscribe({
                next: (response) => {
                    if (response.value == Eliminar.Correcto) {
                        toast.success(response.msg || 'Eliminado correctamente');
                    }
                    if (response.value == Eliminar.Advertencia) {
                        toast.warn(response.msg || 'Liquidaciones encontradas');
                    }
                    this.getLiquidaciones(Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.error('No se pudo eliminar el registro');
                }
            });
        }
    }))
);
