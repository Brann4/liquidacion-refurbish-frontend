import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { DTOLiquidacionRemanufacturaDetalle } from "../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle";
import { inject } from "@angular/core";
import { ToastService } from "@/layout/service/toast.service";
import { LiquidacionRemanufacturaDetalleService } from "../services/remanufactura-detalle.service";

export type RemanufacturaState = {
    entities: DTOLiquidacionRemanufacturaDetalle[];
    entity: DTOLiquidacionRemanufacturaDetalle | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entities: [],
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const RemanufacturaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<RemanufacturaState>(initialState),
    withMethods((store, remanufacturaService = inject(LiquidacionRemanufacturaDetalleService), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },

        closeModalCreate() {
            patchState(store, { isOpenCreate: false });
        },

        setSubmitting(isSubmitting: boolean) {
            patchState(store, { isSubmitting });
        },

        getLiquidaciones(nombre: string, status?: number) {
            remanufacturaService.list(nombre, status).subscribe({
                next: (entities) => {
                    patchState(store, { entities });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
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
/*
        create(data: ) {
            patchState(store, { isSubmitting: true });

            remanufacturaService.create(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Liquidación agreda correctamente.');
                    this.getLiquidaciones(Estado.Todos);
                    this.closeModalCreate();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
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
            */
    }))
);
