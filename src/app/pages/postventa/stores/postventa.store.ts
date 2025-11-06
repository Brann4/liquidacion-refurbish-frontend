import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LiquidacionPostventa } from '@/pages/postventa/entities/liquidacion-postventa';
import { CreateLiquidacionPostventaRequest } from '@/pages/postventa/entities/create-liquidacion-postventa-request';
import { UpdateLiquidacionPostventaRequest } from '@/pages/postventa/entities/update-liquidacion-postventa-request';
import { LiquidacionPostventaResponse } from '@/pages/postventa/entities/liquidacion-postventa-response';
import { PostventaApi } from '@/pages/postventa/services/postventa.api';
import { ToastService } from '@/layout/service/toast.service';
import { Router } from '@angular/router';

export type PostventaState = {
    entities: LiquidacionPostventaResponse[];
    entity: LiquidacionPostventa | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    isLoadingEntities: boolean;
    error: string | null;
};

const initialState: PostventaState = {
    entities: [],
    entity: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    isLoadingEntities: false,
    error: null
};

export const PostventaStore = signalStore(
    { providedIn: 'root' },
    withState<PostventaState>(initialState),
    withMethods((store, postventaService = inject(PostventaApi), toast = inject(ToastService), router = inject(Router)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true, error: null });
        },

        openModalEdit(entity: LiquidacionPostventa) {
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
        setEntity(entity: LiquidacionPostventa) {
            patchState(store, { entity });
        },

        clearError() {
            patchState(store, { error: null });
        },

        getAll() {
            patchState(store, { isLoadingEntities: true, error: null });

            postventaService.getAll().subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            entities: response.value,
                            isLoadingEntities: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar las postventas';
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
                        error: error.message || 'Error al cargar las postventas'
                    });
                    toast.error('Error al cargar las postventas');
                }
            });
        },

        getById(id: number) {
            patchState(store, { isSubmitting: true });

            postventaService.getById(id).subscribe({
                next: (response) => {
                    patchState(store, { entity: response.value, isSubmitting: false });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message, entity: null });
                }
            });
        },

        create(request: CreateLiquidacionPostventaRequest) {
            patchState(store, { isSubmitting: true, error: null });

            postventaService.create(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Postventa creada correctamente');
                        this.closeModalCreate();
                        const newId = response.value.id;
                        // if (newId) {
                        //     router.navigate(['/pages/postventa', newId]);
                        // }
                        this.getAll();
                    } else {
                        const errorMessage = response.msg || 'Error al crear la postventa';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al crear la postventa';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        update(id: number, request: UpdateLiquidacionPostventaRequest) {
            patchState(store, { isSubmitting: true, error: null });

            postventaService.update(id, request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Postventa actualizada correctamente');
                        this.getAll();
                        this.closeModalEdit();
                    } else {
                        const errorMessage = response.msg || 'Error al actualizar la postventa';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al actualizar la postventa';
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

            postventaService.delete(id).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Postventa eliminada correctamente');
                        this.getAll();
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar la postventa';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar la postventa';
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
