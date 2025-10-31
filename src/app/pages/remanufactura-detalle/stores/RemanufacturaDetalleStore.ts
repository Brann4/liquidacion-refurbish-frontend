import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { format } from 'date-fns';
import { DTOPartida } from '@/pages/partida/entities/partida/DTOPartida';
import { RemanufacturaDetalleService } from '../services/remanufactura-detalle.service';
import { DTOLiquidacionRemanufacturaDetalle } from '@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { Estado } from '@/utils/Constants';
import { Eliminar } from '@/pages/remanufactura/stores/RemanufacturaStore';

export type RemanufacturaState = {
    entities: DTOLiquidacionRemanufacturaDetalle[];
    entity: DTOLiquidacionRemanufacturaDetalle | null;
    entityPartida: DTOPartida | null;
    entityPreview: DTOLiquidacionRemanufacturaDetalle[];
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isOpenPartidasManagment: boolean;
    isSubmitting: boolean;
    isLoadingDetailData: boolean;
    isExporting: boolean;
    isLoadingDataPreview: boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entityPartida: null,
    entityPreview: [],
    entities: [],
    isOpenCreate: false,
    isOpenEdit: false,
    isOpenPartidasManagment: false,
    isSubmitting: false,
    isLoadingDetailData: false,
    isLoadingDataPreview: false,
    isExporting: false,
    error: null
};

export const RemanufacturaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<RemanufacturaState>(initialState),
    withMethods((store, remanufacturaService = inject(RemanufacturaDetalleService), toast = inject(ToastService)) => {
        // Declarar los Subjects dentro del withMethods
        const cancelDetailData$ = new Subject<void>();
        const cancelCreateDetail$ = new Subject<void>();
        const cancelExportData$ = new Subject<void>();

        return {
            clear() {
                patchState(store, {
                    isSubmitting: false,
                    isExporting: false,
                    isLoadingDetailData: false,
                    entityPreview: [],
                    entity: null,
                    entities: []
                });
            },

            // Método para cancelar todas las peticiones pendientes
            cancelAllRequests() {
                cancelDetailData$.next();
                cancelExportData$.next();
            },

            openModalCreate() {
                patchState(store, { isOpenCreate: true });
            },

            closeModalCreate() {
                patchState(store, { isOpenCreate: false });
            },

            openModalPartidasManagment() {
                patchState(store, { isOpenPartidasManagment: true });
            },
            closeModalPartidasManagment() {
                patchState(store, { isOpenPartidasManagment: false });
            },

            setEntityPartida(data: DTOPartida) {
                patchState(store, {});
            },

            setEntities(entities: DTOLiquidacionRemanufacturaDetalle[]) {
                patchState(store, { entities });
            },

            setSubmitting(isSubmitting: boolean) {
                patchState(store, { isSubmitting });
            },

            setExportingPreview(isLoadingDataPreview: boolean) {
                patchState(store, { isLoadingDataPreview });
            },

            setEntityPreview(entity: any) {
                patchState(store, { entityPreview: entity });
            },

            getDetailData(nombre: string, status?: number) {
                // Cancelar petición anterior
                cancelDetailData$.next();

                patchState(store, { isLoadingDetailData: true, error: null });

                remanufacturaService
                    .list(nombre, status)
                    .pipe(takeUntil(cancelDetailData$))
                    .subscribe({
                        next: (response) => {
                            if (response) {
                                patchState(store, {
                                    entities: response.value!,
                                    isLoadingDetailData: false
                                });
                            }
                        },
                        error: (error: HttpErrorResponse) => {
                            // No manejamos el error si fue cancelado
                            if (error.status === 0) {
                                // Request cancelado, no hacer nada
                                return;
                            }
                            patchState(store, {
                                isLoadingDetailData: false,
                                error: error.message
                            });
                            toast.warn(`Error al obtener datos: ${error.message}`);
                        }
                    });
            },

            previewData(formData: FormData) {
                // Cancelar petición anterior
                patchState(store, { isSubmitting: true });

                remanufacturaService.previewData(formData).subscribe({
                    next: (response: ApiResponseSingle<ImportPreviewResponse>) => {
                        if (!response.status || response.value.tieneErrores) {
                            patchState(store, { isSubmitting: false });
                            const errorMsg = response.msg || response.value.errors?.join(', ');
                            toast.warn(errorMsg || 'El archivo tiene datos incorrectos.');
                        } else {
                            patchState(store, {
                                isSubmitting: false,
                                entityPreview: response.value.detalles
                            });
                            toast.success(response.msg || 'Archivo procesado. Detalles cargados.');
                            this.closeModalCreate();
                        }
                    },
                    error: (error: HttpErrorResponse) => {
                        patchState(store, {
                            isSubmitting: false,
                            error: error.error?.message || 'Error desconocido'
                        });
                        const errorMsg = error.error?.msg || 'Error desconocido al procesar el archivo.';
                        toast.warn(`Advertencia: ${errorMsg}`);
                    }
                });
            },

            createDetail(data: any) {
                cancelCreateDetail$.next();

                patchState(store, { isSubmitting: true, error: null });

                remanufacturaService
                    .createDetail(data)
                    .pipe(takeUntil(cancelCreateDetail$))
                    .subscribe({
                        next: (response) => {
                            if (response.status) {
                                patchState(store, { isSubmitting: false });
                                toast.info(response.msg);
                                this.clear();
                            }
                        },
                        error: (error: HttpErrorResponse) => {
                            patchState(store, {
                                isSubmitting: false,
                                error: error.message
                            });
                            const errorMsg = error.error.msg || 'Error desconocido al procesar el archivo.';
                            toast.warn(`Advertencia: ${errorMsg}`);
                        }
                    });
            },

            exportDataTable(nombreLiquidacion: string) {
                // Cancelar petición anterior
                cancelExportData$.next();

                patchState(store, { isExporting: true, error: null });

                remanufacturaService
                    .exportDataTable(nombreLiquidacion)
                    .pipe(takeUntil(cancelExportData$))
                    .subscribe({
                        next: (response) => {
                            if (!response.body || response.body.size === 0) {
                                const errorMessage = 'Error: El archivo recibido está vacío.';
                                patchState(store, { isExporting: false, error: errorMessage });
                                toast.error(errorMessage);
                                return;
                            }

                            patchState(store, { isExporting: false });

                            const defaultFileName = `Reporte-Recupero_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`;
                            const fileName = this.getFileNameFromResponse(response) || defaultFileName;

                            this.downloadFile(response.body, fileName);
                            toast.success('Archivo exportado correctamente.');
                        },
                        error: (err: HttpErrorResponse) => {
                            // No manejamos el error si fue cancelado
                            if (err.status === 0) {
                                return;
                            }
                            console.error('Error exportando archivo:', err);
                            patchState(store, {
                                isExporting: false,
                                error: err.error?.message || 'Error al exportar.'
                            });
                            toast.warn('Error al exportar el archivo');
                        }
                    });
            },

            deleteMany(liquidacion: string, ids: number[]) {
                patchState(store, { isLoadingDetailData: true });

                remanufacturaService.deleteMany(ids).subscribe({
                    next: (response) => {
                        if (response.status) {
                            toast.success(response.msg);
                            this.getDetailData(liquidacion, Estado.Todos);
                        }
                        patchState(store, { isLoadingDetailData: false });
                    },
                    error: (error) => {
                        patchState(store, { isSubmitting: false, error: error.message });
                        toast.error(error.error.msg);
                    }
                });
            },

            deleteAll(liquidacion: string) {
                patchState(store, { isLoadingDetailData: true });
                remanufacturaService.deleteAll(liquidacion).subscribe({
                    next: (response) => {
                        if (response.status && response.value == Eliminar.Correcto) {
                            toast.success(response.msg);
                            patchState(store, { isLoadingDetailData: false });
                            this.getDetailData(liquidacion, Estado.Todos);
                        }
                    },
                    error: (error) => {
                        patchState(store, { isLoadingDetailData: false, error: error.message });
                        toast.error(error.error.msg);
                    }
                });
            },

            getFileNameFromResponse(response: any): string | null {
                const contentDisposition = response.headers?.get('Content-Disposition');

                if (!contentDisposition) {
                    return null;
                }

                let matches = /filename\*=UTF-8''([^;]+)/.exec(contentDisposition);

                if (matches && matches[1]) {
                    const decodedFilename = decodeURIComponent(matches[1]);
                    return decodedFilename;
                }

                matches = /filename="?([^";]+)"?/.exec(contentDisposition);

                if (matches && matches[1]) {
                    return matches[1];
                }

                return null;
            },

            downloadFile(blob: Blob, fileName: string) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            },

            // Métodos para cancelar peticiones específicas
            cancelGetDetailData() {
                cancelDetailData$.next();
                patchState(store, { isLoadingDetailData: false });
            },

            cancelExportData() {
                cancelExportData$.next();
                patchState(store, { isExporting: false });
            }
        };
    })
);
