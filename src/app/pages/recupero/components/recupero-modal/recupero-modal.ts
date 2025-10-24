import { Component, computed, effect, inject, signal } from '@angular/core';
import { RecuperoStore } from '@/pages/recupero/stores/recupero.store';
import { LiquidacionRecupero } from '@/pages/recupero/entities/liquidacion-recupero';
import { RecuperoForm } from '@/pages/recupero/components/recupero-form/recupero-form';
import { mapRecuperoFormToCreateRequest, mapRecuperoFormToUpdateRequest, RecuperoFormValue } from '@/pages/recupero/components/recupero-form/recupero-form.model';

@Component({
    selector: 'app-recupero-modal',
    imports: [RecuperoForm],
    template: `
        @if (isCreateModalOpen()) {
            <app-recupero-form [recuperoData]="null" [isLoading]="isSubmitting()" [visible]="true"
                               (save)="onCreateRecupero($event)" (cancel)="onCancelCreate()"
                               (visibleChange)="onCreateVisibilityChange($event)" />
        }

        @if (isEditModalOpen()) {
            <app-recupero-form [recuperoData]="selectedRecupero()" [isLoading]="isSubmitting()" [visible]="true"
                               (save)="onUpdateRecupero($event)" (cancel)="onCancelEdit()"
                               (visibleChange)="onEditVisibilityChange($event)" />
        }
    `,
    styles: ``
})
export class RecuperoModal {
    private readonly recuperoStore = inject(RecuperoStore);

    protected readonly selectedRecupero = signal<LiquidacionRecupero | null>(null);
    protected readonly isCreateModalOpen = computed(() => this.recuperoStore.isOpenCreate());
    protected readonly isEditModalOpen = computed(() => this.recuperoStore.isOpenEdit());
    protected readonly isSubmitting = computed(() => this.recuperoStore.isSubmitting());

    private currentRecuperoId!: number;

    constructor() {
        effect(() => {
            const isEditOpen = this.isEditModalOpen();
            if (isEditOpen) {
                const selectedRecupero = this.recuperoStore.entity();
                if (selectedRecupero) {
                    this.currentRecuperoId = selectedRecupero.id;
                    this.selectedRecupero.set(selectedRecupero);
                } else {
                    console.error('No recupero data available for editing');
                    this.recuperoStore.closeModalEdit();
                }
            } else {
                this.selectedRecupero.set(null);
            }
        });
    }

    protected onCreateRecupero(formValue: RecuperoFormValue): void {
        const createRequest = mapRecuperoFormToCreateRequest(formValue, 1);
        this.recuperoStore.create(createRequest);
    }

    protected onUpdateRecupero(formValue: RecuperoFormValue): void {
        const updateRequest = mapRecuperoFormToUpdateRequest(formValue);
        this.recuperoStore.update(this.currentRecuperoId, updateRequest);
    }

    protected onCancelCreate(): void {
        this.recuperoStore.closeModalCreate();
    }

    protected onCancelEdit(): void {
        this.recuperoStore.closeModalEdit();
    }

    protected onCreateVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.recuperoStore.closeModalCreate();
        }
    }

    protected onEditVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.recuperoStore.closeModalEdit();
        }
    }
}
