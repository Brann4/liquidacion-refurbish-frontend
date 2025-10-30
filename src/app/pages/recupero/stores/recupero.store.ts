import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';
import { CreateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/create-liquidacion-recupero-request';
import { UpdateLiquidacionRecuperoRequest } from '@/pages/recupero/entities/update-liquidacion-recupero-request';
import { LiquidacionRecuperoResponse } from '@/pages/recupero/entities/liquidacion-recupero-response';
import { RecuperoApi } from '@/pages/recupero/services/recupero.api';
import { ToastService } from '@/layout/service/toast.service';
import { Router } from '@angular/router';

export type RecuperoState = {
    entities: LiquidacionRecuperoResponse[];
    entity: LiquidacionRecupero | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: RecuperoState = {
    entities: [],
    entity: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const RecuperoStore = signalStore(
    { providedIn: 'root' },
    withState<RecuperoState>(initialState),
    withMethods((store, recuperoService = inject(RecuperoApi), toast = inject(ToastService), router = inject(Router)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true, error: null });
        },

        openModalEdit(entity: LiquidacionRecupero) {
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

            recuperoService.getAll().subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            entities: response.value,
                            isSubmitting: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar los recuperos';
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
                        error: error.message || 'Error al cargar los recuperos'
                    });
                    toast.error('Error al cargar los recuperos');
                }
            });
        },

        create(request: CreateLiquidacionRecuperoRequest) {
            patchState(store, { isSubmitting: true, error: null });

            recuperoService.create(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Recupero creado correctamente');
                        this.closeModalCreate();
                        const newId = response.value.id;
                        if (newId) {
                            router.navigate(['/pages/recupero', newId]);
                        }
                        this.getAll();
                    } else {
                        const errorMessage = response.msg || 'Error al crear el recupero';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al crear el recupero';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        update(id: number, request: UpdateLiquidacionRecuperoRequest) {
            patchState(store, { isSubmitting: true, error: null });

            recuperoService.update(id, request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Recupero actualizado correctamente');
                        this.getAll();
                        this.closeModalEdit();
                    } else {
                        const errorMessage = response.msg || 'Error al actualizar el recupero';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al actualizar el recupero';
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

            recuperoService.delete(id).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Recupero eliminado correctamente');
                        this.getAll();
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar el recupero';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar el recupero';
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
