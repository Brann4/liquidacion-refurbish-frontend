import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { PrecioZona } from '@/pages/precio-zona/entities/precio-zona';
import { CreatePrecioZonaRequest } from '@/pages/precio-zona/entities/create-precio-zona-request';
import { UpdatePrecioZonaRequest } from '@/pages/precio-zona/entities/update-precio-zona-request';
import { PrecioZonaApi } from '@/pages/precio-zona/services/precio-zona.api';
import { ToastService } from '@/layout/service/toast.service';

export type PrecioZonaState = {
    entities: PrecioZona[];
    entity: PrecioZona | null;
    currentContrataId: number | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: PrecioZonaState = {
    entities: [],
    entity: null,
    currentContrataId: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const PrecioZonaStore = signalStore(
    { providedIn: 'root' },
    withState<PrecioZonaState>(initialState),
    withMethods((store, precioZonaService = inject(PrecioZonaApi), toast = inject(ToastService)) => ({
        setCurrentContrata(contrataId: number) {
            patchState(store, { currentContrataId: contrataId });
        },

        openModalCreate() {
            patchState(store, { isOpenCreate: true, error: null });
        },

        openModalEdit(entity: PrecioZona) {
            patchState(store, { entity, isOpenEdit: true, error: null });
        },

        closeModalCreate() {
            patchState(store, { isOpenCreate: false, error: null });
        },

        closeModalEdit() {
            patchState(store, { isOpenEdit: false, entity: null, error: null });
        },

        setSubmitting(isSubmitting: boolean) {
            patchState(store, { isSubmitting });
        },

        clearError() {
            patchState(store, { error: null });
        },

        getByContrata(contrataId: number) {
            patchState(store, { isSubmitting: true, error: null, currentContrataId: contrataId });

            precioZonaService.getByContrata(contrataId).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            entities: response.value,
                            isSubmitting: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar los precios de zona';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    patchState(store, {
                        isSubmitting: false,
                        error: error.message || 'Error al cargar los precios de zona'
                    });
                    toast.error('Error al cargar los precios de zona');
                }
            });
        },

        create(request: CreatePrecioZonaRequest) {
            patchState(store, { isSubmitting: true, error: null });

            precioZonaService.create(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Precio de zona creado correctamente');
                        if (store.currentContrataId()) {
                            this.getByContrata(store.currentContrataId()!);
                        }
                        this.closeModalCreate();
                    } else {
                        const errorMessage = response.msg || 'Error al crear el precio de zona';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al crear el precio de zona';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        update(id: number, request: UpdatePrecioZonaRequest) {
            patchState(store, { isSubmitting: true, error: null });

            precioZonaService.update(id, request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Precio de zona actualizado correctamente');
                        if (store.currentContrataId()) {
                            this.getByContrata(store.currentContrataId()!);
                        }
                        this.closeModalEdit();
                    } else {
                        const errorMessage = response.msg || 'Error al actualizar el precio de zona';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al actualizar el precio de zona';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        delete(id: number) {
            patchState(store, { isSubmitting: true, error: null });

            precioZonaService.delete(id).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Precio de zona eliminado correctamente');
                        if (store.currentContrataId()) {
                            this.getByContrata(store.currentContrataId()!);
                        }
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar el precio de zona';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar el precio de zona';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        }
    }))
);
