import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DTOLiquidacionRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { RemanufacturaDetalleService } from '../services/remanufactura-detalle.service';
import { ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { HttpErrorResponse } from '@angular/common/http';

export type RemanufacturaState = {
    entities: DTOLiquidacionRemanufacturaDetalle[];
    entity: DTOLiquidacionRemanufacturaDetalle | null;
    entityPreview: DTOLiquidacionRemanufacturaDetalle[];
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entityPreview: [],
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
        clear() {
            patchState(store, { isSubmitting: false, entityPreview: [], entity: null , entities: []});
        },
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

        previewData(formData: FormData) {
            patchState(store, { isSubmitting: true });

            remanufacturaService.previewData(formData).subscribe({
                next: (response: ApiResponseSingle<ImportPreviewResponse>) => {
                    if (!response.status || response.value.tieneErrores) {
                        patchState(store, { isSubmitting: false });
                        const errorMsg = response.msg || response.value.errors?.join(', ');
                        toast.warn(errorMsg || 'El archivo tiene datos incorrectos.');
                    } else {
                        patchState(store, { isSubmitting: false, entityPreview: response.value.detalles });
                        toast.success(response.msg || 'Archivo procesado. Detalles cargados.');
                        this.closeModalCreate();
                    }
                },
                error: (error: HttpErrorResponse) => {
                    patchState(store, { isSubmitting: false, error: error.error.message });
                    const errorMsg = error.error?.msg || 'Error desconocido al procesar el archivo.';
                    toast.warn(`Advertencia: ${errorMsg}`);
                }
            });
        },

        createDetail(data: any) {
            patchState(store, { isSubmitting: true });
            remanufacturaService.createDetail(data).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.info(response.msg);
                        this.clear();
                    }
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    const errorMsg = error.msg || 'Error desconocido al procesar el archivo.';
                    toast.warn(`Advertencia: ${errorMsg}`);
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

            */
    }))
);
