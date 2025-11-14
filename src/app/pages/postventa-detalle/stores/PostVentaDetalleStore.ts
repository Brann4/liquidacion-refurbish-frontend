import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { DTOPartida } from '@/pages/partida/entities/partida/DTOPartida';
import { PostVentaDetalleService } from '../services/postventa-detalle.service';
import type { DTOLiquidacionPostVentaDetalle } from '../entities/postventa-detalle/DTOPostVentaDetalle';
import { ContrataApi } from '@/pages/contrata/services/contrata.api';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { DTOCreatePostVentaDetalle } from '../entities/postventa-detalle/DTOCreatePostVentaDetalle';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { format } from 'date-fns';
import { PaginationInfo } from '@/utils/paginated-data';
import { DeleteLiquidacionPostventaDetalleByIdsRequest } from '@/pages/postventa-detalle/entities/delete-liquidacion-postventa-detalle-by-ids-request';
import { LiquidacionPostventa } from '@/pages/postventa/entities/liquidacion-postventa';
import { PostventaApi } from '@/pages/postventa/services/postventa.api';

export type PostVentaDetalleState = {
    entities: DTOLiquidacionPostVentaDetalle[];
    entity: DTOLiquidacionPostVentaDetalle | null;
    entitiesPreview: DTOLiquidacionPostVentaDetalle[];
    contrata: Contrata | null;
    liquidacionPostventa: LiquidacionPostventa | null;
    pagination: PaginationInfo | null;
    currentPage: number;
    pageSize: number;
    searchFilter: string;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    isLoadingDetailData: boolean;
    isLoadingContrata: boolean;
    isLoadingCreate: boolean;
    isLoadingPostventa: boolean;
    isExporting: boolean;
    isDeleting: boolean;
    isLoadingDataPreview: boolean;
    error: string | null;
};

const initialState: PostVentaDetalleState = {
    entity: null,
    entitiesPreview: [],
    entities: [],
    contrata: null,
    liquidacionPostventa: null,
    pagination: null,
    currentPage: 1,
    pageSize: 10,
    searchFilter: '',
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    isLoadingContrata: false,
    isLoadingCreate: false,
    isLoadingPostventa: false,
    isLoadingDetailData: false,
    isLoadingDataPreview: false,
    isExporting: false,
    isDeleting: false,
    error: null
};

export const PostVentaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<PostVentaDetalleState>(initialState),
    withMethods((store, postVentaDetalleService = inject(PostVentaDetalleService), postVentaService = inject(PostventaApi), contrataService = inject(ContrataApi), toast = inject(ToastService)) => {
        // Declarar los Subjects dentro del withMethods
        const cancelDetailData$ = new Subject<void>();
        const cancelExportData$ = new Subject<void>();

        return {
            clear() {
                patchState(store, {
                    entity: null,
                    entitiesPreview: [],
                    entities: [],
                    contrata: null,
                    liquidacionPostventa: null,
                    pagination: null,
                    currentPage: 1,
                    pageSize: 10,
                    searchFilter: '',
                    isOpenCreate: false,
                    isOpenEdit: false,
                    isSubmitting: false,
                    isLoadingContrata: false,
                    isLoadingCreate: false,
                    isLoadingPostventa: false,
                    isLoadingDetailData: false,
                    isLoadingDataPreview: false,
                    isExporting: false,
                    isDeleting: false,
                    error: null
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

            clearPreview() {
                patchState(store, { entitiesPreview: [], error: null });
            },

            setDeleting(isDeleting: boolean) {
                patchState(store, { isDeleting });
            },

            setCurrentPage(currentPage: number) {
                patchState(store, { currentPage });
            },

            setPageSize(pageSize: number) {
                patchState(store, { pageSize });
            },

            setSearchFilter(searchFilter: string) {
                const normalizedFilter = searchFilter.trim();
                patchState(store, { searchFilter: normalizedFilter });
            },

            loadCurrentData(liquidacionPostventaId: number) {
                this.getDetailData(liquidacionPostventaId, store.currentPage(), store.pageSize(), store.searchFilter() || undefined);
            },

            getDetailData(liquidacionPostventaId: number, page: number = 1, pageSize: number = 10, searchFilter?: string) {
                // Cancelar petición anterior
                cancelDetailData$.next();

                patchState(store, { isLoadingDetailData: true, error: null });

                postVentaDetalleService
                    .list(liquidacionPostventaId, page, pageSize, searchFilter)
                    .pipe(takeUntil(cancelDetailData$))
                    .subscribe({
                        next: (response) => {
                            if (response.status && response.value) {
                                patchState(store, {
                                    entities: response.value.items,
                                    pagination: response.value.pagination,
                                    isLoadingDetailData: false,
                                    error: null
                                });
                            } else {
                                const errorMessage = response.msg || 'Error al cargar los detalles del postventa';
                                patchState(store, {
                                    isLoadingDetailData: false,
                                    error: errorMessage
                                });
                                toast.error(errorMessage);
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
                            this.loadCurrentData(request.liquidacionPostventaId);
                            this.getPostventaById(request.liquidacionPostventaId);
                        } else {
                            const errorMessage = response.msg || 'Error al crear el detalle del postventa';
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

            getPostventaById(id: number) {
                patchState(store, { isLoadingPostventa: true, error: null });

                postVentaService.getById(id).subscribe({
                    next: (response) => {
                        if (response.status && response.value) {
                            patchState(store, {
                                liquidacionPostventa: response.value,
                                isLoadingPostventa: false,
                                error: null
                            });
                        } else {
                            const errorMessage = response.msg || 'Error al cargar el recupero';
                            patchState(store, {
                                isLoadingPostventa: false,
                                error: errorMessage
                            });
                            toast.error(errorMessage);
                        }
                    },
                    error: (error) => {
                        patchState(store, {
                            isLoadingPostventa: false,
                            error: error.message || 'Error al cargar el recupero'
                        });
                        toast.error('Error al cargar el recupero');
                    }
                });
            },

            export(liquidacionPostventaId: number) {
                patchState(store, { isExporting: true, error: null });

                postVentaDetalleService.export(liquidacionPostventaId).subscribe({
                    next: (response) => {
                        if (!response.body || response.body.size === 0) {
                            const errorMessage = 'Error: El archivo recibido está vacío.';
                            patchState(store, { isExporting: false, error: errorMessage });
                            toast.error(errorMessage);
                            return;
                        }

                        patchState(store, { isExporting: false });

                        const defaultFileName = `Reporte-Postventa_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`;
                        const fileName = this.getFileNameFromResponse(response) || defaultFileName;

                        this.downloadFile(response.body, fileName);
                        toast.success('Archivo exportado correctamente.');
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al exportar el archivo';
                        patchState(store, {
                            isExporting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                });
            },

            deleteByLiquidacionPostventaId(liquidacionPostventaId: number) {
                patchState(store, { isDeleting: true, error: null });

                postVentaDetalleService.deleteByLiquidacionPostventaId(liquidacionPostventaId).subscribe({
                    next: (response) => {
                        if (response.status && response.value) {
                            patchState(store, {
                                isDeleting: false,
                                entities: [],
                                pagination: null
                            });
                            toast.success(response.msg || 'Detalles del postventa eliminados correctamente');
                        } else {
                            const errorMessage = response.msg || 'Error al eliminar los detalles del postventa';
                            patchState(store, {
                                isDeleting: false,
                                error: errorMessage
                            });
                            toast.error(errorMessage);
                        }
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al eliminar los detalles del postventa';
                        patchState(store, {
                            isDeleting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                });
            },

            deleteByIds(liquidacionPostventaId: number, request: DeleteLiquidacionPostventaDetalleByIdsRequest) {
                patchState(store, { isDeleting: true, error: null });

                postVentaDetalleService.deleteByIds(request).subscribe({
                    next: (response) => {
                        if (response.status && response.value) {
                            patchState(store, { isDeleting: false });
                            toast.success(response.msg || 'Detalles del postventa eliminados correctamente');
                            this.loadCurrentData(liquidacionPostventaId);
                        } else {
                            const errorMessage = response.msg || 'Error al eliminar los detalles del postventa';
                            patchState(store, {
                                isDeleting: false,
                                error: errorMessage
                            });
                            toast.error(errorMessage);
                        }
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al eliminar los detalles del postventa';
                        patchState(store, {
                            isDeleting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                });
            },

            getFileNameFromResponse(response: HttpResponse<Blob>): string | null {
                const contentDisposition = response.headers.get('Content-Disposition');

                if (!contentDisposition) {
                    return null;
                }

                let matches = /filename\*=UTF-8''([^;]+)/.exec(contentDisposition);

                if (matches && matches[1]) {
                    return decodeURIComponent(matches[1]);
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
