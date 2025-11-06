import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { DTOPartidaConItem } from '../entities/partidas-detalle/DTOPartidaConItem';
import type { DTOPartidaSeleccionada } from '../entities/partidas-detalle/DTOPartidaSeleccionada';
import { computed, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@/layout/service/toast.service';
import { PartidaRemanufacturaDetalleService } from '../services/partida-items.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DTOCreatePartidasSeleccionadas } from '../entities/partidas-detalle/DTOCreatePartidasSeleccionadas';

export type PartidaDetalleState = {
    partidasConItems: DTOPartidaConItem[]; // Para el Step 1
    seleccionesGuardadas: DTOPartidaSeleccionada[]; // Para Req. 4 (Persistencia)
    currentDetalleId: number | null; // ID del LiquidacionRemanufacturaDetalle
    isLoading: boolean;
    isOpenPartidasManagment: boolean;
    isSubmitting: boolean; // Para el botón de Guardar
    error: string | null;
};

const initialState: PartidaDetalleState = {
    partidasConItems: [],
    seleccionesGuardadas: [],
    isOpenPartidasManagment: false,
    currentDetalleId: null,
    isLoading: false,
    isSubmitting: false,
    error: null
};

export const PartidaRemanufacturaDetalleStore = signalStore(
    { providedIn: 'root' },
    withState<PartidaDetalleState>(initialState),
    withComputed((store) => ({
        // Señal computada para saber si estamos cargando CUALQUIER cosa
        isLoadingData: computed(() => store.isLoading() || store.isSubmitting())
    })),
    withMethods((store, partidaRemanufacturaDetalleService = inject(PartidaRemanufacturaDetalleService), toast = inject(ToastService)) => {
        // Declarar los Subjects dentro del withMethods
        const cancelSubscriptions$ = new Subject<void>();

        return {
            clearState() {
                patchState(store, initialState);
            },

            cancelSubscriptions() {
                cancelSubscriptions$.next();
            },

            openModalManagment(detalleId: number) {
                // 1. Cancela cargas anteriores
                cancelSubscriptions$.next();
                // 2. Resetea el estado
                patchState(store, { ...initialState, currentDetalleId: detalleId, isOpenPartidasManagment: true });
                this.loadSelections(detalleId);
            },

            closeModalPartidasManagment() {

                patchState(store, { isOpenPartidasManagment: false });
            },

            setSubmitting(isSubmitting: boolean) {
                patchState(store, { isSubmitting });
            },

            // --- MÉTODO PARA EL PASO 1: Cargar Partidas y Items ---
            loadPartidasItems() {
                patchState(store, { isLoading: true, error: null });

                partidaRemanufacturaDetalleService
                    .loadPartidasItems() // Llama al backend (GetPartidasConItemsQuery)
                    .pipe(takeUntil(cancelSubscriptions$))
                    .subscribe({
                        next: (response) => {
                            if (response.status && response.value) {
                                patchState(store, {partidasConItems: response.value,isLoading: false});
                            } else {
                                patchState(store, { isLoading: false, error: response.msg });
                                toast.error('Error', response.msg);
                            }
                        },
                        error: (error: HttpErrorResponse) => {
                            patchState(store, { isLoading: false, error: error.message });
                            toast.error('Error', 'No se pudieron cargar las partidas.');
                        }
                    });
            },

            // --- MÉTODO PARA REQ. 4: Cargar Selecciones Guardadas ---
            loadSelections(detalleId: number) {
                patchState(store, { isLoading: true, error: null });

                partidaRemanufacturaDetalleService
                    .loadSelections(detalleId) // Llama al nuevo endpoint GET
                    .pipe(takeUntil(cancelSubscriptions$))
                    .subscribe({
                        next: (response) => {
                            if (response.status && response.value) {
                                patchState(store, {
                                    seleccionesGuardadas: response.value,
                                    isLoading: false
                                });
                            } else {
                                patchState(store, { isLoading: false });
                            }
                        },
                        error: (error: HttpErrorResponse) => {
                            patchState(store, { isLoading: false, error: error.message });
                            toast.warn('Advertencia', 'No se pudieron cargar las selecciones guardadas.');
                        }
                    });
            },

            // --- MÉTODO PARA EL PASO 3: Guardar Selecciones ---
            savePartidas(payload: DTOCreatePartidasSeleccionadas) {
                patchState(store, { isSubmitting: true, error: null });

                partidaRemanufacturaDetalleService
                    .saveSelections(payload) // Llama al endpoint POST 'GuardarPartidasDetalle'
                    .pipe(takeUntil(cancelSubscriptions$))
                    .subscribe({
                        next: (response) => {
                            if (response.status) {
                                patchState(store, { isSubmitting: false, seleccionesGuardadas: payload.selecciones });
                                toast.success('Éxito', 'Partidas guardadas correctamente.');
                                // Aquí podrías cerrar el modal si quisieras
                            } else {
                                patchState(store, { isSubmitting: false, error: response.msg });
                                toast.error('Error', response.msg);
                            }
                        },
                        error: (error: HttpErrorResponse) => {
                            patchState(store, { isSubmitting: false, error: error.message });
                            toast.error('Error', 'No se pudieron guardar las partidas.');
                        }
                    });
            }
        };
    })
);
