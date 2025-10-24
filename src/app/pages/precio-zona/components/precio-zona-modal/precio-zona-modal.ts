import { Component, computed, effect, inject, signal } from '@angular/core';
import { PrecioZonaStore } from '@/pages/precio-zona/store/precio-zona.store';
import { ContrataStore } from '@/pages/contrata/store/contrata.store';
import { PrecioZona } from '@/pages/precio-zona/entities/precio-zona';
import { PrecioZonaForm } from '@/pages/precio-zona/components/precio-zona-form/precio-zona-form';
import { mapPrecioZonaFormToCreateRequest, mapPrecioZonaFormToUpdateRequest, PrecioZonaFormValue } from '@/pages/precio-zona/components/precio-zona-form/precio-zona-form.model';

@Component({
    selector: 'app-precio-zona-modal',
    imports: [PrecioZonaForm],
    template: `
        @if (isCreateModalOpen()) {
            <app-precio-zona-form [precioZonaData]="null" [isLoading]="isSubmitting()" [visible]="true" (save)="onCreatePrecioZona($event)" (cancel)="onCancelCreate()" (visibleChange)="onCreateVisibilityChange($event)" />
        }

        @if (isEditModalOpen()) {
            <app-precio-zona-form [precioZonaData]="selectedPrecioZona()" [isLoading]="isSubmitting()" [visible]="true" (save)="onUpdatePrecioZona($event)" (cancel)="onCancelEdit()" (visibleChange)="onEditVisibilityChange($event)" />
        }
    `,
    styles: ``
})
export class PrecioZonaModal {
    private readonly precioZonaStore = inject(PrecioZonaStore);
    private readonly contrataStore = inject(ContrataStore);

    protected readonly selectedPrecioZona = signal<PrecioZona | null>(null);
    protected readonly isCreateModalOpen = computed(() => this.precioZonaStore.isOpenCreate());
    protected readonly isEditModalOpen = computed(() => this.precioZonaStore.isOpenEdit());
    protected readonly isSubmitting = computed(() => this.precioZonaStore.isSubmitting());
    protected readonly currentContrataId = computed(() => this.precioZonaStore.currentContrataId());

    private currentPrecioZonaId!: number;

    constructor() {
        this.contrataStore.getAll();

        effect(() => {
            const isEditOpen = this.isEditModalOpen();
            if (isEditOpen) {
                const selectedPrecioZona = this.precioZonaStore.entity();
                if (selectedPrecioZona) {
                    this.currentPrecioZonaId = selectedPrecioZona.id;
                    this.selectedPrecioZona.set(selectedPrecioZona);
                } else {
                    console.error('No precio zona data available for editing');
                    this.precioZonaStore.closeModalEdit();
                }
            } else {
                this.selectedPrecioZona.set(null);
            }
        });
    }

    protected onCreatePrecioZona(formValue: PrecioZonaFormValue): void {
        const contrataId = this.currentContrataId();
        if (contrataId === null) {
            console.error('No contrata selected for creating precio zona');
            return;
        }
        const createRequest = mapPrecioZonaFormToCreateRequest(formValue, contrataId, 1);
        this.precioZonaStore.create(createRequest);
    }

    protected onUpdatePrecioZona(formValue: PrecioZonaFormValue): void {
        const contrataId = this.selectedPrecioZona()?.contrataId || this.currentContrataId();
        if (contrataId === null || contrataId === undefined) {
            console.error('No contrata ID available for updating precio zona');
            return;
        }
        const updateRequest = mapPrecioZonaFormToUpdateRequest(formValue, contrataId);
        this.precioZonaStore.update(this.currentPrecioZonaId, updateRequest);
    }

    protected onCancelCreate(): void {
        this.precioZonaStore.closeModalCreate();
    }

    protected onCancelEdit(): void {
        this.precioZonaStore.closeModalEdit();
    }

    protected onCreateVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.precioZonaStore.closeModalCreate();
        }
    }

    protected onEditVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.precioZonaStore.closeModalEdit();
        }
    }
}
