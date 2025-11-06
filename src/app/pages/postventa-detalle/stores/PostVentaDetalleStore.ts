import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { DTOPartida } from '@/pages/partida/entities/partida/DTOPartida';
import { Eliminar } from '@/pages/remanufactura/stores/RemanufacturaStore';
import { PostVentaDetalleService } from '../services/postventa-detalle.service';
import type { DTOLiquidacionPostVentaDetalle } from '../entities/postventa-detalle/DTOPostVentaDetalle';
import { ContrataApi } from '@/pages/contrata/services/contrata.api';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { DTOCreatePostVentaDetalle } from '../entities/postventa-detalle/DTOCreatePostVentaDetalle';

export type PostVentaDetalleState = {
    entities: DTOLiquidacionPostVentaDetalle[];
    entity: DTOLiquidacionPostVentaDetalle | null;
    entitiesPreview: DTOLiquidacionPostVentaDetalle[];
    contrata: Contrata | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    isLoadingDetailData: boolean;
    isLoadingContrata: boolean;
    isLoadingCreate:boolean;
    isExporting: boolean;
    isLoadingDataPreview: boolean;
    error: string | null;
};

const initialState: PostVentaDetalleState = {
    entity: null,
    entitiesPreview: [],
    entities: [],
    contrata: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    isLoadingContrata: false,
    isLoadingCreate: false,
    isLoadingDetailData: false,
    isLoadingDataPreview: false,
    isExporting: false,
    error: null
};

export const PostVentaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<PostVentaDetalleState>(initialState),
    withMethods((store, postVentaDetalleService = inject(PostVentaDetalleService), contrataService = inject(ContrataApi), toast = inject(ToastService)) => {
        // Declarar los Subjects dentro del withMethods
        const cancelDetailData$ = new Subject<void>();
        const cancelExportData$ = new Subject<void>();

        return {
            clear() {
                patchState(store, {
                    isSubmitting: false,
                    isExporting: false,
                    isLoadingDetailData: false,
                    entitiesPreview: [],
                    entity: null
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

            setEntityPartida(data: DTOPartida) {
                patchState(store, {});
            },

            setEntities(entities: DTOLiquidacionPostVentaDetalle[]) {
                patchState(store, { entities });
            },

            setSubmitting(isSubmitting: boolean) {
                patchState(store, { isSubmitting });
            },

            setExportingPreview(isLoadingDataPreview: boolean) {
                patchState(store, { isLoadingDataPreview });
            },

            setEntityPreview(entity: any) {
                patchState(store, { entitiesPreview: entity });
            },

            create(request: DTOCreatePostVentaDetalle) {
                patchState(store, { isLoadingCreate: true, error: null });

                postVentaDetalleService.create(request).subscribe({
                    next: (response) => {
                        if (response.status && response.value) {
                            patchState(store, {
                                isLoadingCreate: false,
                                entitiesPreview: []
                            });
                            toast.success(response.msg || 'Detalle del postventa creado correctamente');
                        } else {
                            const errorMessage = response.msg || 'Error al crear el detalle del recupero';
                            patchState(store, {
                                isLoadingCreate: false,
                                error: errorMessage
                            });
                            toast.error(errorMessage);
                        }
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al crear el detalle del postventa';
                        patchState(store, {
                            isLoadingCreate: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                });
            },

            getContrataById(contrataId: number) {
                patchState(store, { isLoadingContrata: true, error: null });

                contrataService.getById(contrataId).subscribe({
                    next: (response) => {
                        if (response.status && response.value) {
                            patchState(store, {
                                contrata: response.value,
                                isLoadingContrata: false,
                                error: null
                            });
                        } else {
                            const errorMessage = response.msg || 'Error al cargar la contrata';
                            patchState(store, {
                                isLoadingContrata: false,
                                error: errorMessage
                            });
                            toast.error(errorMessage);
                        }
                    },
                    error: (error) => {
                        patchState(store, {
                            isLoadingContrata: false,
                            error: error.message || 'Error al cargar la contrata'
                        });
                        toast.error('Error al cargar la contrata');
                    }
                });
            },

            deleteMany(idLiquidacion: number, ids: number[]) {
                patchState(store, { isLoadingDetailData: true });

                postVentaDetalleService.deleteMany(ids).subscribe({
                    next: (response) => {
                        if (response.status) {
                            toast.success(response.msg);
                            //this.getDetailData(idLiquidacion);
                        }
                        patchState(store, { isLoadingDetailData: false });
                    },
                    error: (error) => {
                        patchState(store, { isSubmitting: false, error: error.message });
                        toast.error(error.error.msg);
                    }
                });
            },

            deleteAll(idLiquidacion: number) {
                patchState(store, { isLoadingDetailData: true });
                postVentaDetalleService.deleteAll(idLiquidacion).subscribe({
                    next: (response) => {
                        if (response.status && response.value == Eliminar.Correcto) {
                            toast.success(response.msg);
                            patchState(store, { isLoadingDetailData: false });
                            //this.getDetailData(idLiquidacion, Estado.Todos);
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
