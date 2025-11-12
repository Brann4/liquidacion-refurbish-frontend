import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { format } from 'date-fns';
import { LiquidacionRecuperoDetalle } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle';
import { LiquidacionRecuperoDetallePreview } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle-preview';
import { CreateLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/create-liquidacion-recupero-detalle-request';
import { PreviewLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/preview-liquidacion-recupero-detalle-request';
import { DeleteLiquidacionRecuperoDetalleByIdsRequest } from '@/pages/recupero-detalle/entities/delete-liquidacion-recupero-detalle-by-ids-request';
import { RecuperoDetalleApi } from '@/pages/recupero-detalle/services/recupero-detalle.api';
import { ToastService } from '@/layout/service/toast.service';
import { ContrataApi } from '@/pages/contrata/services/contrata.api';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { RecuperoApi } from '@/pages/recupero/services/recupero.api';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';
import { LiquidacionRecuperoExcel } from '@/pages/service/liquidacion-recupero-excel';
import { PaginationInfo } from '@/utils/paginated-data';

export type RecuperoDetalleState = {
    entities: LiquidacionRecuperoDetalle[];
    entitiesPreview: LiquidacionRecuperoDetallePreview[];
    contrata: Contrata | null;
    liquidacionRecupero: LiquidacionRecupero | null;
    pagination: PaginationInfo | null;
    currentPage: number;
    pageSize: number;
    searchFilter: string;
    isLoadingEntities: boolean;
    isLoadingPreview: boolean;
    isLoadingCreate: boolean;
    isLoadingContrata: boolean;
    isLoadingRecupero: boolean;
    isExporting: boolean;
    isDeleting: boolean;
    error: string | null;
};

const initialState: RecuperoDetalleState = {
    entities: [],
    entitiesPreview: [],
    contrata: null,
    liquidacionRecupero: null,
    pagination: null,
    currentPage: 1,
    pageSize: 10,
    searchFilter: '',
    isLoadingEntities: false,
    isLoadingPreview: false,
    isLoadingCreate: false,
    isLoadingContrata: false,
    isLoadingRecupero: false,
    isExporting: false,
    isDeleting: false,
    error: null
};

export const RecuperoDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<RecuperoDetalleState>(initialState),
    withMethods((store, recuperoDetalleService = inject(RecuperoDetalleApi), contrataService = inject(ContrataApi), recuperoService = inject(RecuperoApi), excelService = inject(LiquidacionRecuperoExcel), toast = inject(ToastService)) => ({
        setLoadingEntities(isLoadingEntities: boolean) {
            patchState(store, { isLoadingEntities });
        },

        setLoadingPreview(isLoadingPreview: boolean) {
            patchState(store, { isLoadingPreview });
        },

        setLoadingCreate(isLoadingCreate: boolean) {
            patchState(store, { isLoadingCreate });
        },

        setLoadingContrata(isLoadingContrata: boolean) {
            patchState(store, { isLoadingContrata });
        },

        setLoadingRecupero(isLoadingRecupero: boolean) {
            patchState(store, { isLoadingRecupero });
        },

        setExporting(isExporting: boolean) {
            patchState(store, { isExporting });
        },

        clearError() {
            patchState(store, { error: null });
        },

        clearPreview() {
            patchState(store, { entitiesPreview: [], error: null });
        },

        clearContrata() {
            patchState(store, { contrata: null, error: null });
        },

        clearRecupero() {
            patchState(store, { liquidacionRecupero: null, error: null });
        },

        clearAll() {
            patchState(store, {
                entities: [],
                entitiesPreview: [],
                contrata: null,
                liquidacionRecupero: null,
                pagination: null,
                currentPage: 1,
                pageSize: 10,
                searchFilter: '',
                isLoadingEntities: false,
                isLoadingPreview: false,
                isLoadingCreate: false,
                isLoadingContrata: false,
                isLoadingRecupero: false,
                isExporting: false,
                isDeleting: false,
                error: null
            });
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

        loadCurrentData(liquidacionRecuperoId: number) {
            this.getByRecupero(liquidacionRecuperoId, store.currentPage(), store.pageSize(), store.searchFilter() || undefined);
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

        getRecuperoById(id: number) {
            patchState(store, { isLoadingRecupero: true, error: null });

            recuperoService.getById(id).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            liquidacionRecupero: response.value,
                            isLoadingRecupero: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar el recupero';
                        patchState(store, {
                            isLoadingRecupero: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    patchState(store, {
                        isLoadingRecupero: false,
                        error: error.message || 'Error al cargar el recupero'
                    });
                    toast.error('Error al cargar el recupero');
                }
            });
        },

        getByRecupero(liquidacionRecuperoId: number, page: number = 1, pageSize: number = 10, searchFilter?: string) {
            patchState(store, { isLoadingEntities: true, error: null });

            recuperoDetalleService.getByRecupero(liquidacionRecuperoId, page, pageSize, searchFilter).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            entities: response.value.items,
                            pagination: response.value.pagination,
                            isLoadingEntities: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar los detalles del recupero';
                        patchState(store, {
                            isLoadingEntities: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    patchState(store, {
                        isLoadingEntities: false,
                        error: error.message || 'Error al cargar los detalles del recupero'
                    });
                    toast.error('Error al cargar los detalles del recupero');
                }
            });
        },

        async preview(request: PreviewLiquidacionRecuperoDetalleRequest) {
            patchState(store, { isLoadingPreview: true, error: null });

            try {
                const result = await excelService.processFileAsync(request.file);

                patchState(store, {
                    entitiesPreview: result,
                    isLoadingPreview: false,
                    error: null
                });
                toast.success('Vista previa generada correctamente');
            } catch (error: any) {
                const errorMessage = error.message || 'Error al generar la vista previa';
                patchState(store, {
                    isLoadingPreview: false,
                    error: errorMessage
                });
                toast.error(errorMessage);
            }
        },

        create(request: CreateLiquidacionRecuperoDetalleRequest) {
            patchState(store, { isLoadingCreate: true, error: null });

            recuperoDetalleService.create(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            isLoadingCreate: false,
                            entitiesPreview: []
                        });
                        toast.success(response.msg || 'Detalle del recupero creado correctamente');
                        this.loadCurrentData(request.liquidacionRecuperoId);
                        this.getRecuperoById(request.liquidacionRecuperoId);
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
                    const errorMessage = error.message || 'Error al crear el detalle del recupero';
                    patchState(store, {
                        isLoadingCreate: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        export(liquidacionRecuperoId: number) {
            patchState(store, { isExporting: true, error: null });

            recuperoDetalleService.export(liquidacionRecuperoId).subscribe({
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

        deleteByLiquidacionRecuperoId(liquidacionRecuperoId: number) {
            patchState(store, { isDeleting: true, error: null });

            recuperoDetalleService.deleteByLiquidacionRecuperoId(liquidacionRecuperoId).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            isDeleting: false,
                            entities: [],
                            pagination: null
                        });
                        toast.success(response.msg || 'Detalles del recupero eliminados correctamente');
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar los detalles del recupero';
                        patchState(store, {
                            isDeleting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar los detalles del recupero';
                    patchState(store, {
                        isDeleting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        deleteByIds(request: DeleteLiquidacionRecuperoDetalleByIdsRequest) {
            patchState(store, { isDeleting: true, error: null });

            recuperoDetalleService.deleteByIds(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isDeleting: false });
                        toast.success(response.msg || 'Detalles del recupero eliminados correctamente');
                        const liquidacionRecuperoId = store.liquidacionRecupero()?.id;
                        if (liquidacionRecuperoId) {
                            this.loadCurrentData(liquidacionRecuperoId);
                        }
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar los detalles del recupero';
                        patchState(store, {
                            isDeleting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar los detalles del recupero';
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
        }
    }))
);
