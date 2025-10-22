import { Component, computed, inject, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ContrataStore } from '@/pages/contrata/store/contrata.store';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { ContrataModal } from '@/pages/contrata/components/contrata-modal/contrata-modal';
import { PrimeModules } from '@/utils/PrimeModule';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';

@Component({
    selector: 'app-view-contrata',
    imports: [PrimeModules, ContrataModal],
    templateUrl: './view-contrata.html',
    styles: ``
})
export class ViewContrata implements OnInit {
    private readonly contrataStore = inject(ContrataStore);
    private confirmationDialogService = inject(ConfirmationDialog);
    protected readonly contratas = computed(() => this.contrataStore.entities());

    ngOnInit(): void {
        this.loadContratas();
    }

    protected loadContratas(): void {
        this.contrataStore.getAll();
    }

    protected openCreateModal(): void {
        this.contrataStore.openModalCreate();
    }

    protected onEditContrata(contrata: Contrata): void {
        this.contrataStore.openModalEdit(contrata);
    }

    protected onDeleteContrata(contrata: Contrata): void {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.contrataStore.delete(contrata.id);
            }
        });
    }

    protected onGlobalFilter(event: Event, dataTable: Table): void {
        const target = event.target as HTMLInputElement | null;
        const filterValue = target?.value ?? '';
        dataTable.filterGlobal(filterValue, 'contains');
    }
}
