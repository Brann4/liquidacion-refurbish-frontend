import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { CreateContrataRequest } from '@/pages/contrata/entities/create-contrata-request';
import { UpdateContrataRequest } from '@/pages/contrata/entities/update-contrata-request';
import { ContrataApi } from '@/pages/contrata/services/contrata.api';
import { ToastService } from '@/layout/service/toast.service';

export type ContrataState = {
    entities: Contrata[];
    entity: Contrata | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: ContrataState = {
    entities: [],
    entity: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const ContrataStore = signalStore(
    { providedIn: 'root' },
    withState<ContrataState>(initialState),
    withMethods((store, contrataService = inject(ContrataApi), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true, error: null });
        },

        openModalEdit(entity: Contrata) {
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

        getAll() {
            patchState(store, { isSubmitting: true, error: null });

            contrataService.getAll().subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            entities: response.value,
                            isSubmitting: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar las contratas';
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
                        error: error.message || 'Error al cargar las contratas'
                    });
                    toast.error('Error al cargar las contratas');
                }
            });
        },

        create(request: CreateContrataRequest) {
            patchState(store, { isSubmitting: true, error: null });

            contrataService.create(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Contrata creada correctamente');
                        this.getAll();
                        this.closeModalCreate();
                    } else {
                        const errorMessage = response.msg || 'Error al crear la contrata';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al crear la contrata';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        update(id: number, request: UpdateContrataRequest) {
            patchState(store, { isSubmitting: true, error: null });

            contrataService.update(id, request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Contrata actualizada correctamente');
                        this.getAll();
                        this.closeModalEdit();
                    } else {
                        const errorMessage = response.msg || 'Error al actualizar la contrata';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al actualizar la contrata';
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

            contrataService.delete(id).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Contrata eliminada correctamente');
                        this.getAll();
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar la contrata';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar la contrata';
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
