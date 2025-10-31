import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DTOLiquidacionRemanufacturaDetalle } from '../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { RemanufacturaDetalleService } from '../services/remanufactura-detalle.service';
import { ApiResponseSingle, ImportPreviewResponse } from '@/utils/ApiResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { DTOXlsxPreview } from '../entities/remanufactura-detalle/DTOXlsxPreview';

export type RemanufacturaState = {
    entities: DTOLiquidacionRemanufacturaDetalle[];
    entity: DTOLiquidacionRemanufacturaDetalle | null;
    entityPreview: DTOLiquidacionRemanufacturaDetalle[];
    entityXlsxPreview: DTOXlsxPreview[];
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    isLoadingDetailData: boolean;
    isExporting: boolean;
    isLoadingDataPreview: boolean;
    error: string | null;
};

const initialState: RemanufacturaState = {
    entity: null,
    entityPreview: [],
    entityXlsxPreview: [],
    entities: [],
    isOpenCreate: false,
    isOpenEdit: false,
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
                    entityXlsxPreview: [],
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
                            const blob = response.body;
                            if (!blob || blob.size === 0) {
                                patchState(store, { isExporting: false });
                                toast.warn('El archivo devuelto por el servidor está vacío.');
                                return;
                            }

                            const contentDisposition = response.headers.get('content-disposition');
                            let fileName = `Reporte_${new Date().toISOString().split('T')[0]}`;

                            if (contentDisposition) {
                                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                                if (fileNameMatch && fileNameMatch.length > 1) {
                                    fileName = fileNameMatch[1];
                                }
                            }

                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = fileName;
                            a.click();
                            window.URL.revokeObjectURL(url);

                            patchState(store, { isExporting: false });
                            toast.success('Archivo descargado exitosamente');
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
