import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DTOLiquidacionRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { Estado } from '@/utils/Constants';
import { RemanufacturaDetalleService } from '../services/remanufactura-detalle.service';
import { ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';

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
    withMethods((store, remanufacturaService = inject(RemanufacturaDetalleService), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },

        closeModalCreate() {
            patchState(store, { isOpenCreate: false });
        },

        setSubmitting(isSubmitting: boolean) {
            patchState(store, { isSubmitting });
        },

        getDetailData(nombre: string, status?: number) {
            remanufacturaService.list(nombre, status).subscribe({
                next: (entities) => {
                    patchState(store, { entities });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                }
            });
        },

        previewData(formData: FormData) 
        {
            patchState(store, { isSubmitting: true });

            remanufacturaService.previewData(formData).subscribe({
                next: (response: ApiResponseSingle<ImportPreviewResponse>) => {
                    if (!response.status || response.value.tieneErrores) {
                        patchState(store, { isSubmitting: false });
                        const errorMsg = response.msg || response.value.errors?.join(', ');
                        toast.warn(errorMsg || 'El archivo tiene datos incorrectos.');
                    }
                    else {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Archivo procesado. Detalles cargados.');
                        this.getDetailData(formData.get('liquidacion')!.toString(), Estado.Todos);
                        this.closeModalCreate();
                    }
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        }
        /*
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
