import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DTOLiquidacionRemanufactura } from '../entities/remanufactura/DTOLiquidacionRemanufactura';
import { DTOUpdateLiquidacionRemanufactura } from '../entities/remanufactura/DTOUpdateLiquidacionRemanufactura';
import { DTOCreateLiquidacionRemanufactura } from '../entities/remanufactura/DTOCreateLiquidacionRemanufactura';
import { LiquidacionRemanufacturaService } from '../services/remanufactura.service';
import { Estado } from '@/utils/Constants';
import { ToastService } from '@/layout/service/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    isLoadingData: boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entities: [],
    entityEdit: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    isLoadingData: false,
    error: null
};

export const RemanufacturaStore = signalStore(
    { providedIn: 'root' },
    withState<RemanufacturaState>(initialState),
    withMethods((store, remanufacturaService = inject(LiquidacionRemanufacturaService), toast = inject(ToastService), router = inject(Router), routerActivate = inject(ActivatedRoute)) => ({
        clear() {
            patchState(store, { isSubmitting: false, entity: null, entities: [] });
        },
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

        setLoadingData (isLoadingData: boolean){
            patchState(store, { isLoadingData});
        },

        getLiquidaciones(status?: number) {
            this.setLoadingData(true);
            remanufacturaService.list(status).subscribe({
                next: (entities) => {
                    patchState(store, { entities});
                     this.setLoadingData(false);
                },
                error: (error) => {
                    patchState(store, { error: error.message });
                     this.setLoadingData(false);
                }
            });
        },

        getById(id: number) {
            patchState(store, { isSubmitting: true });

            remanufacturaService.getById(id).subscribe({
                next: (response) => {
                    patchState(store, { entity: response.value, isSubmitting: false });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message, entity: null });
                }
            });
        },

        create(data: DTOCreateLiquidacionRemanufactura, route?: ActivatedRoute) {
            patchState(store, { isSubmitting: true });

            remanufacturaService.create(data).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success('Liquidación agreda correctamente.');
                        this.getLiquidaciones(Estado.Todos);
                        this.closeModalCreate();
                        /*REDIRECCION DESPUES DE CREAR*/
                        if (route) router.navigate([response.value.id], { relativeTo: route });
                    }
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.error.message });
                    toast.warn(`Advertencia: ${error.error.msg}`);
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

        delete(idLiquidacion: number) {
            remanufacturaService.delete(idLiquidacion).subscribe({
                next: (response) => {
                    if (response.value == Eliminar.Correcto) {
                        toast.success(response.msg || 'Eliminado correctamente');
                    }
                    if (response.value == Eliminar.Advertencia) {
                        toast.warn('Liquidaciones importadas estan asociadas en este registro');
                    }
                    this.getLiquidaciones(Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.error(error.error.msg);
                }
            });
        }
    }))
);
