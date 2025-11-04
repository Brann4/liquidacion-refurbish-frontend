import { Component, computed, effect, inject, signal } from '@angular/core';
import { PostventaStore } from '@/pages/postventa/stores/postventa.store';
import { LiquidacionPostventa } from '@/pages/postventa/entities/liquidacion-postventa';
import { PostventaForm } from '@/pages/postventa/components/postventa-form/postventa-form';
import { mapPostventaFormToCreateRequest, mapPostventaFormToUpdateRequest, PostventaFormValue } from '@/pages/postventa/components/postventa-form/postventa-form.model';

@Component({
    selector: 'app-postventa-modal',
    imports: [PostventaForm],
    template: `
        @if (isCreateModalOpen()) {
            <app-postventa-form [postventaData]="null" [isLoading]="isSubmitting()" [visible]="true" (save)="onCreatePostventa($event)" (cancel)="onCancelCreate()" (visibleChange)="onCreateVisibilityChange($event)" />
        }

        @if (isEditModalOpen()) {
            <app-postventa-form [postventaData]="selectedPostventa()" [isLoading]="isSubmitting()" [visible]="true" (save)="onUpdatePostventa($event)" (cancel)="onCancelEdit()" (visibleChange)="onEditVisibilityChange($event)" />
        }
    `,
    styles: ``
})
export class PostventaModal {
    private readonly postventaStore = inject(PostventaStore);

    protected readonly selectedPostventa = signal<LiquidacionPostventa | null>(null);
    protected readonly isCreateModalOpen = computed(() => this.postventaStore.isOpenCreate());
    protected readonly isEditModalOpen = computed(() => this.postventaStore.isOpenEdit());
    protected readonly isSubmitting = computed(() => this.postventaStore.isSubmitting());

    private currentPostventaId!: number;

    constructor() {
        effect(() => {
            const isEditOpen = this.isEditModalOpen();
            if (isEditOpen) {
                const selectedPostventa = this.postventaStore.entity();
                if (selectedPostventa) {
                    this.currentPostventaId = selectedPostventa.id;
                    this.selectedPostventa.set(selectedPostventa);
                } else {
                    console.error('No postventa data available for editing');
                    this.postventaStore.closeModalEdit();
                }
            } else {
                this.selectedPostventa.set(null);
            }
        });
    }

    protected onCreatePostventa(formValue: PostventaFormValue): void {
        const createRequest = mapPostventaFormToCreateRequest(formValue, 1);
        this.postventaStore.create(createRequest);
    }

    protected onUpdatePostventa(formValue: PostventaFormValue): void {
        const updateRequest = mapPostventaFormToUpdateRequest(formValue);
        this.postventaStore.update(this.currentPostventaId, updateRequest);
    }

    protected onCancelCreate(): void {
        this.postventaStore.closeModalCreate();
    }

    protected onCancelEdit(): void {
        this.postventaStore.closeModalEdit();
    }

    protected onCreateVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.postventaStore.closeModalCreate();
        }
    }

    protected onEditVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.postventaStore.closeModalEdit();
        }
    }
}
