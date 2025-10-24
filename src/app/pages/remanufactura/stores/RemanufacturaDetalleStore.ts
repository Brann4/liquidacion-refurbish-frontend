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
    isExporting:boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entityPreview: [],
    entities: [],
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    isExporting: false,
    error: null
};

export const RemanufacturaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<RemanufacturaState>(initialState),
    withMethods((store, remanufacturaService = inject(RemanufacturaDetalleService), toast = inject(ToastService)) => ({
        clear() {
            patchState(store, { isSubmitting: false, entityPreview: [], entity: null, entities: [] });
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
        },

        exportDataTable(nombreLiquidacion: string) {
            patchState(store, { isExporting: true });

            remanufacturaService.exportDataTable(nombreLiquidacion).subscribe({
                next: (response) => {
                    const fileName = `LiquidacionRemanufactura_${new Date().toISOString().split('T')[0]}.xlsx`;

                    // Crear enlace temporal para descargar el archivo
                    const url = window.URL.createObjectURL(response);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);

                    patchState(store, { isExporting: false });
                    toast.success('Archivo descargado exitosamente');
                },
                error: (err) => {
                    console.error('Error exportando archivo:', err);
                    patchState(store, { isExporting: false, error: err.error?.message || 'Error al exportar.' });
                    toast.warn('Error al exportar el archivo');
                }
            });
        }
    }))
);
