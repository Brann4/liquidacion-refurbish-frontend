import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { ToastService } from '@/layout/service/toast.service';
import { DTOPartidaItem } from '../entities/partidaItem/DTOPartidaItem';
import { DTOUpdatePartidaItem } from '../entities/partidaItem/DTOUpdatePartidaItem';
import { PartidaDetalleService } from '../services/partida-detalle.service';
import { DTOCreatePartidaItem } from '../entities/partidaItem/DTOCreatePartidaItem';
import { Estado } from '@/utils/Constants';

export enum Eliminar {
    Correcto = 1,
    Advertencia = 2
}

export type PartidaItemState = {
    entities: DTOPartidaItem[];
    entity: DTOPartidaItem | null;
    entityEdit: DTOUpdatePartidaItem | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    error: string | null;
};

const initialState: PartidaItemState = {
    entity: null,
    entities: [],
    entityEdit: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    error: null
};

export const PartidaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<PartidaItemState>(initialState),
    withMethods((store, partidaDetalleService = inject(PartidaDetalleService), toast = inject(ToastService)) => ({
        clear() {
            patchState(store, { isSubmitting: false, entity: null, entities: [] });
        },
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
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

        getDetailData(id: number, status?: number) {
            partidaDetalleService.list(id, status).subscribe({
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

            partidaDetalleService.getById(id).subscribe({
                next: (response) => {
                    patchState(store, { entity: response.value, isSubmitting: false });
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message, entity: null });
                }
            });
        },

        create(data: DTOCreatePartidaItem) {
            patchState(store, { isSubmitting: true });

            partidaDetalleService.create(data).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success('Item agregado correctamente.');
                        this.getDetailData(data.partidaId!, Estado.Todos);
                        this.closeModalCreate();
                    }
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.error.message });
                    toast.warn(`Advertencia: ${error.error.msg}`);
                }
            });
        },

        update(data: DTOUpdatePartidaItem) {
            patchState(store, { isSubmitting: true });

            partidaDetalleService.update(data).subscribe({
                next: (response) => {
                    patchState(store, { isSubmitting: false });
                    toast.success('Item actualizado correctamente.');
                    this.closeModalEdit();
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.warn(`Advertencia: ${error.msg}`);
                }
            });
        },

        delete(data: DTOPartidaItem, idPartida: number) {
            partidaDetalleService.delete(data.id).subscribe({
                next: (response) => {
                    toast.success(response.msg || 'Eliminado correctamente');
                    this.getDetailData(idPartida, Estado.Todos);
                },
                error: (error) => {
                    patchState(store, { isSubmitting: false, error: error.message });
                    toast.error(error.error.msg || "Error al enviar solicitud al servidor");
                }
            });
        }
    }))
);
