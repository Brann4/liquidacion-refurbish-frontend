import { Component, computed, inject, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { RecuperoStore } from '@/pages/recupero/stores/recupero.store';
import { RecuperoModal } from '@/pages/recupero/components/recupero-modal/recupero-modal';
import { PrimeModules } from '@/utils/PrimeModule';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { LiquidacionRecuperoResponse } from '@/pages/recupero/entities/liquidacion-recupero-response';
import { mapResponseToLiquidacionRecupero } from '@/pages/recupero/mappers/recupero.mapper';

@Component({
    selector: 'app-view-recupero',
    imports: [PrimeModules, RecuperoModal],
    templateUrl: './view-recupero.html',
    styles: ``
})
export class ViewRecupero implements OnInit {
    private readonly recuperoStore = inject(RecuperoStore);
    private confirmationDialogService = inject(ConfirmationDialog);
    protected readonly recuperos = computed(() => this.recuperoStore.entities());

    ngOnInit(): void {
        this.loadRecuperos();
    }

    protected loadRecuperos(): void {
        this.recuperoStore.getAll();
    }

    protected openCreateModal(): void {
        this.recuperoStore.openModalCreate();
    }

    protected onEditRecupero(recupero: LiquidacionRecuperoResponse): void {
        this.recuperoStore.openModalEdit(mapResponseToLiquidacionRecupero(recupero));
    }

    protected onDeleteRecupero(recupero: LiquidacionRecuperoResponse): void {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.recuperoStore.delete(recupero.id);
            }
        });
    }

    protected onGlobalFilter(event: Event, dataTable: Table): void {
        const target = event.target as HTMLInputElement | null;
        const filterValue = target?.value ?? '';
        dataTable.filterGlobal(filterValue, 'contains');
    }
}
