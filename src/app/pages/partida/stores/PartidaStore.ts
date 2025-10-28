import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Estado } from '@/utils/Constants';
import { ToastService } from '@/layout/service/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PartidaService } from '../services/partida.service';
import { DTOPartida } from '../entities/partida/DTOPartida';
import { DTOUpdatePartida } from '../entities/partida/DTOUpdatePartida';
import { DTOCreatePartida } from '../entities/partida/DTOCreatePartida';

export enum Eliminar {
    Correcto = 1,
    Advertencia = 2
}

export type PartidaState = {
    entities: DTOPartida[];
    entity: DTOPartida | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    entityEdit: DTOUpdatePartida | null;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: PartidaState = {
    entity: null,
    entities: [],
    entityEdit: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const PartidaStore = signalStore(
    { providedIn: 'root' },
    withState<PartidaState>(initialState),
    withMethods((store, partidaService = inject(PartidaService), toast = inject(ToastService), router = inject(Router)) => ({

        clear() {
            patchState(store, { isSubmitting: false, entity: null , entities: []});
        },
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },
        openModalEdit(entity: DTOUpdatePartida) {
            patchState(store, { entityEdit: entity, isOpenEdit: true });
        },
        closeModalCreate() {
            patchState(store, { isOpenCreate: false });
        },
        closeModalEdit() {
            patchState(store, { isOpenEdit: false, entityEdit: null });
        },
        setSubmitting(isSubmitting: boolean) {
            patchState(store, { isSubmitting });
        },

        list(status?: number) {
            partidaService.list(status).subscribe({
                next: (entities) => {
                    patchState(store, { entities });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                }
            });
        },

        getById(id: number) {
            patchState(store, { isSubmitting: true });

            partidaService.getById(id).subscribe({
                next: (response) => {
                    patchState(store, { entity: response.value, isSubmitting: false });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message, entity: null });
                }
            });
        },

        create(data: DTOCreatePartida, route?: ActivatedRoute) {
            patchState(store, { isSubmitting: true });

            partidaService.create(data).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success('Partida agreda correctamente.');
                        this.list(Estado.Todos);
                        this.closeModalCreate();
                        /*REDIRECCION DESPUES DE CREAR*/
                        if (route) router.navigate([response.value.id], { relativeTo: route });
                    }
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.error.message });
                    toast.warn(`Advertencia: ${error.error.msg}`);
                }
            });
        },

        update(data: DTOUpdatePartida) {
            patchState(store, { isSubmitting: true });

            partidaService.update(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Partida actualizada correctamente.');
                    this.list(Estado.Todos);
                    this.closeModalEdit();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        delete(id: number) {
            partidaService.delete(id).subscribe({
                next: (response) => {
                    if (response.value == Eliminar.Correcto) {
                        toast.success(response.msg || 'Eliminado correctamente');
                    }
                    this.list(Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.error(error.error.msg);
                }
            });
        }
    }))
);
