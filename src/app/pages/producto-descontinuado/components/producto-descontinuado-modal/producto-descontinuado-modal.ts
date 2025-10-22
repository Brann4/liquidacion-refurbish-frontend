import { Component, computed, effect, inject, signal } from '@angular/core';
import { ProductoDescontinuadoStore } from '@/pages/producto-descontinuado/store/producto-descontinuado.store';
import { ProductoDescontinuado } from '@/pages/producto-descontinuado/entities/producto-descontinuado';
import { ProductoDescontinuadoForm } from '@/pages/producto-descontinuado/components/producto-descontinuado-form/producto-descontinuado-form';
import { mapProductoDescontinuadoFormToCreateRequest, mapProductoDescontinuadoFormToUpdateRequest, ProductoDescontinuadoFormValue } from '@/pages/producto-descontinuado/components/producto-descontinuado-form/producto-descontinuado-form.model';

@Component({
    selector: 'app-producto-descontinuado-modal',
    imports: [ProductoDescontinuadoForm],
    template: `
        @if (isCreateModalOpen()) {
            <app-producto-descontinuado-form [productData]="null" [isLoading]="isSubmitting()" [visible]="true" (save)="onCreateProduct($event)" (cancel)="onCancelCreate()" (visibleChange)="onCreateVisibilityChange($event)" />
        }

        @if (isEditModalOpen()) {
            <app-producto-descontinuado-form [productData]="selectedProduct()" [isLoading]="isSubmitting()" [visible]="true" (save)="onUpdateProduct($event)" (cancel)="onCancelEdit()" (visibleChange)="onEditVisibilityChange($event)" />
        }
    `,
    styles: ``
})
export class ProductoDescontinuadoModal {
    private readonly discontinuedProductStore = inject(ProductoDescontinuadoStore);

    protected readonly selectedProduct = signal<ProductoDescontinuado | null>(null);
    protected readonly isCreateModalOpen = computed(() => this.discontinuedProductStore.isOpenCreate());
    protected readonly isEditModalOpen = computed(() => this.discontinuedProductStore.isOpenEdit());
    protected readonly isSubmitting = computed(() => this.discontinuedProductStore.isSubmitting());

    private currentProductId!: number;

    constructor() {
        effect(() => {
            const isEditOpen = this.isEditModalOpen();
            if (isEditOpen) {
                const selectedProduct = this.discontinuedProductStore.entity();
                if (selectedProduct) {
                    this.currentProductId = selectedProduct.id;
                    this.selectedProduct.set(selectedProduct);
                } else {
                    console.error('No product data available for editing');
                    this.discontinuedProductStore.closeModalEdit();
                }
            } else {
                this.selectedProduct.set(null);
            }
        });
    }

    protected onCreateProduct(formValue: ProductoDescontinuadoFormValue): void {
        const createRequest = mapProductoDescontinuadoFormToCreateRequest(formValue, 1);
        this.discontinuedProductStore.create(createRequest);
    }

    protected onUpdateProduct(formValue: ProductoDescontinuadoFormValue): void {
        const updateRequest = mapProductoDescontinuadoFormToUpdateRequest(formValue);
        this.discontinuedProductStore.update(this.currentProductId, updateRequest);
    }

    protected onCancelCreate(): void {
        this.discontinuedProductStore.closeModalCreate();
    }

    protected onCancelEdit(): void {
        this.discontinuedProductStore.closeModalEdit();
    }

    protected onCreateVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.discontinuedProductStore.closeModalCreate();
        }
    }

    protected onEditVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.discontinuedProductStore.closeModalEdit();
        }
    }
}
