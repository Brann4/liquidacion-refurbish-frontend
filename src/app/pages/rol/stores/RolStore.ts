import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Estado } from '@/utils/Constants';
import { ToastService } from '@/layout/service/toast.service';
import { RolService } from '../services/rol.service';
import { DTORol } from '../entities/DTORol';
import { DTOUpdateRol } from '../entities/DTOUpdateRol';
import { DTOCreateRol } from '../entities/DTOCreateRol';

export enum Eliminar {
    Correcto = 1,
    Advertencia = 2
}

export type RolState = {
    entities: DTORol[];
    entity: DTORol | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    entityEdit: DTOUpdateRol | null;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: RolState = {
    entity: null,
    entities: [],
    entityEdit: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const RolStore = signalStore(
    { providedIn: 'root' },
    withState<RolState>(initialState),
    withMethods((store, rolService = inject(RolService), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },
        openModalEdit(entity: DTOUpdateRol) {
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

        getRols(status?: number) {
            rolService.list(status).subscribe({
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

            rolService.getById(id).subscribe({
                next: (response) => {
                    patchState(store, { entity: response.value, isSubmitting: false });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message, entity: null });
                }
            });
        },

        create(data: DTOCreateRol) {
            patchState(store, { isSubmitting: true });

            rolService.create(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Usuario agredo correctamente.');
                    this.getRols(Estado.Todos);
                    this.closeModalCreate();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        update(data: DTOUpdateRol) {
            patchState(store, { isSubmitting: true });

            rolService.update(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Usuario actualizado correctamente.');
                    this.getRols(Estado.Todos);
                    this.closeModalEdit();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        delete(id: number) {
            rolService.delete(id).subscribe({
                next: (response) => {
                    if (response.value == Eliminar.Correcto) {
                        toast.success(response.msg || 'Eliminado correctamente');
                    }
                    if (response.value == Eliminar.Advertencia) {
                        toast.warn(response.msg || 'Usuarios encontrados');
                    }
                    this.getRols(Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.error('No se pudo eliminar el registro');
                }
            });
        },

        clear(){
            patchState(store,{entities: []})
        }
    }))
);
