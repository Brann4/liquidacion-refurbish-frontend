import { Component, computed, effect, inject, signal } from '@angular/core';
import { ContrataStore } from '@/pages/contrata/store/contrata.store';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { ContrataForm } from '@/pages/contrata/components/contrata-form/contrata-form';
import { mapContrataFormToCreateRequest, mapContrataFormToUpdateRequest, ContrataFormValue } from '@/pages/contrata/components/contrata-form/contrata-form.model';

@Component({
    selector: 'app-contrata-modal',
    imports: [ContrataForm],
    template: `
        @if (isCreateModalOpen()) {
            <app-contrata-form [contrataData]="null" [isLoading]="isSubmitting()" [visible]="true" (save)="onCreateContrata($event)" (cancel)="onCancelCreate()" (visibleChange)="onCreateVisibilityChange($event)" />
        }

        @if (isEditModalOpen()) {
            <app-contrata-form [contrataData]="selectedContrata()" [isLoading]="isSubmitting()" [visible]="true" (save)="onUpdateContrata($event)" (cancel)="onCancelEdit()" (visibleChange)="onEditVisibilityChange($event)" />
        }
    `,
    styles: ``
})
export class ContrataModal {
    private readonly contrataStore = inject(ContrataStore);

    protected readonly selectedContrata = signal<Contrata | null>(null);
    protected readonly isCreateModalOpen = computed(() => this.contrataStore.isOpenCreate());
    protected readonly isEditModalOpen = computed(() => this.contrataStore.isOpenEdit());
    protected readonly isSubmitting = computed(() => this.contrataStore.isSubmitting());

    private currentContrataId!: number;

    constructor() {
        effect(() => {
            const isEditOpen = this.isEditModalOpen();
            if (isEditOpen) {
                const selectedContrata = this.contrataStore.entity();
                if (selectedContrata) {
                    this.currentContrataId = selectedContrata.id;
                    this.selectedContrata.set(selectedContrata);
                } else {
                    console.error('No contrata data available for editing');
                    this.contrataStore.closeModalEdit();
                }
            } else {
                this.selectedContrata.set(null);
            }
        });
    }

    protected onCreateContrata(formValue: ContrataFormValue): void {
        const createRequest = mapContrataFormToCreateRequest(formValue);
        this.contrataStore.create(createRequest);
    }

    protected onUpdateContrata(formValue: ContrataFormValue): void {
        const updateRequest = mapContrataFormToUpdateRequest(formValue);
        this.contrataStore.update(this.currentContrataId, updateRequest);
    }

    protected onCancelCreate(): void {
        this.contrataStore.closeModalCreate();
    }

    protected onCancelEdit(): void {
        this.contrataStore.closeModalEdit();
    }

    protected onCreateVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.contrataStore.closeModalCreate();
        }
    }

    protected onEditVisibilityChange(visible: boolean): void {
        if (!visible) {
            this.contrataStore.closeModalEdit();
        }
    }
}
