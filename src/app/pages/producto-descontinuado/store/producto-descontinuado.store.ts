import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProductoDescontinuado } from '@/pages/producto-descontinuado/entities/producto-descontinuado';
import { CreateProductoDescontinuadoRequest } from '@/pages/producto-descontinuado/entities/create-producto-descontinuado-request';
import { UpdateProductoDescontinuadoRequest } from '@/pages/producto-descontinuado/entities/update-producto-descontinuado-request';
import { ProductoDescontinuadoApi } from '@/pages/producto-descontinuado/services/producto-descontinuado.api';
import { ToastService } from '@/layout/service/toast.service';

export type ProductoDescontinuadoState = {
    entities: ProductoDescontinuado[];
    entity: ProductoDescontinuado | null;
    isOpenCreate: boolean;
    isOpenEdit: boolean;
    isSubmitting: boolean;
    isLoadingEntities: boolean;
    error: string | null;
};

const initialState: ProductoDescontinuadoState = {
    entities: [],
    entity: null,
    isOpenCreate: false,
    isOpenEdit: false,
    isSubmitting: false,
    isLoadingEntities: false,
    error: null
};

export const ProductoDescontinuadoStore = signalStore(
    { providedIn: 'root' },
    withState<ProductoDescontinuadoState>(initialState),
    withMethods((store, productoDescontinuadoService = inject(ProductoDescontinuadoApi), toast = inject(ToastService)) => ({
        openModalCreate() {
            patchState(store, { isOpenCreate: true, error: null });
        },

        openModalEdit(entity: ProductoDescontinuado) {
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
            patchState(store, { isLoadingEntities: true, error: null });

            productoDescontinuadoService.getAll().subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, {
                            entities: response.value,
                            isLoadingEntities: false,
                            error: null
                        });
                    } else {
                        const errorMessage = response.msg || 'Error al cargar los productos descontinuados';
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
                        error: error.message || 'Error al cargar los productos descontinuados'
                    });
                    toast.error('Error al cargar los productos descontinuados');
                }
            });
        },

        create(request: CreateProductoDescontinuadoRequest) {
            patchState(store, { isSubmitting: true, error: null });

            productoDescontinuadoService.create(request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Producto descontinuado creado correctamente');
                        this.getAll();
                        this.closeModalCreate();
                    } else {
                        const errorMessage = response.msg || 'Error al crear el producto descontinuado';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al crear el producto descontinuado';
                    patchState(store, {
                        isSubmitting: false,
                        error: errorMessage
                    });
                    toast.error(errorMessage);
                }
            });
        },

        update(id: number, request: UpdateProductoDescontinuadoRequest) {
            patchState(store, { isSubmitting: true, error: null });

            productoDescontinuadoService.update(id, request).subscribe({
                next: (response) => {
                    if (response.status && response.value) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Producto descontinuado actualizado correctamente');
                        this.getAll();
                        this.closeModalEdit();
                    } else {
                        const errorMessage = response.msg || 'Error al actualizar el producto descontinuado';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al actualizar el producto descontinuado';
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

            productoDescontinuadoService.delete(id).subscribe({
                next: (response) => {
                    if (response.status) {
                        patchState(store, { isSubmitting: false });
                        toast.success(response.msg || 'Producto descontinuado eliminado correctamente');
                        this.getAll();
                    } else {
                        const errorMessage = response.msg || 'Error al eliminar el producto descontinuado';
                        patchState(store, {
                            isSubmitting: false,
                            error: errorMessage
                        });
                        toast.error(errorMessage);
                    }
                },
                error: (error) => {
                    const errorMessage = error.message || 'Error al eliminar el producto descontinuado';
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
