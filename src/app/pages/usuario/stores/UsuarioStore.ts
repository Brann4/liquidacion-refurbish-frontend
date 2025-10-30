import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Estado } from '@/utils/Constants';
import { ToastService } from '@/layout/service/toast.service';
import { DTOUsuario } from '../entities/DTOUsuario';
import { DTOUpdateUsuario } from '../entities/DTOUpdateUsuario';
import { UsuarioService } from '../services/usuario.service';
import { DTOCreateUsuario } from '../entities/DTOCreateUsuario';

export enum Eliminar {
    Correcto = 1,
    Advertencia = 2
}

export type UsuarioState = {
    entities: DTOUsuario[];
    entity: DTOUsuario | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    entityEdit: DTOUpdateUsuario | null;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: UsuarioState = {
    entity: null,
    entities: [],
    entityEdit: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const UsuarioStore = signalStore(
    { providedIn: 'root' },
    withState<UsuarioState>(initialState),
    withMethods((store, usuarioService = inject(UsuarioService), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },
        openModalEdit(entity: DTOUpdateUsuario) {
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

        getUsuarios(status?: number) {
            usuarioService.list(status).subscribe({
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

            usuarioService.getById(id).subscribe({
                next: (response) => {
                    patchState(store, { entity: response.value, isSubmitting: false });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message, entity: null });
                }
            });
        },

        create(data: DTOCreateUsuario) {
            patchState(store, { isSubmitting: true });

            usuarioService.create(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Usuario agredo correctamente.');
                    this.closeModalCreate();
                    this.getUsuarios(Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        update(data: DTOUpdateUsuario) {
            patchState(store, { isSubmitting: true });

            usuarioService.update(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Usuario actualizado correctamente.');
                    this.closeModalEdit();
                    this.getUsuarios(Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        delete(id: number) {
            usuarioService.delete(id).subscribe({
                next: (response) => {
                    if (response.status) {
                        toast.success(response.msg || 'Eliminado correctamente');
                        patchState(store, {entity: null, entityEdit: null})
                        this.getUsuarios(Estado.Todos);
                    }

                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.error('No se pudo eliminar el registro');
                }
            });
        }
    }))
);
