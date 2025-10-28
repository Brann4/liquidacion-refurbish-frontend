import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { PrimeModules } from '@/utils/PrimeModule';
import { RecuperoStore } from '@/pages/recupero/stores/recupero.store';
import { RecuperoDetalleStore } from '@/pages/recupero-detalle/stores/recupero-detalle.store';
import { RecuperoModal } from '@/pages/recupero/components/recupero-modal/recupero-modal';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { LiquidacionRecuperoResponse } from '@/pages/recupero/entities/liquidacion-recupero-response';
import { mapResponseToLiquidacionRecupero } from '@/pages/recupero/mappers/recupero.mapper';
import { BreadcrumbHeader } from '@/layout/component/breadcrumb/breadcrumb.header';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';

@Component({
    selector: 'app-view-recupero',
    imports: [PrimeModules, RecuperoModal, BreadcrumbHeader, ShortDatePipe],
    templateUrl: './view-recupero.html',
    styles: ``
})
export class ViewRecupero implements OnInit {
    private readonly recuperoStore = inject(RecuperoStore);
    private readonly recuperoDetalleStore = inject(RecuperoDetalleStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private confirmationDialogService = inject(ConfirmationDialog);
    protected readonly recuperos = computed(() => this.recuperoStore.entities());
    protected readonly breadcrumbs = [{ label: 'Recupero' }];

    ngOnInit(): void {
        this.loadRecuperos();
    }

    protected loadRecuperos(): void {
        this.recuperoStore.getAll();
    }

    protected openCreateModal(): void {
        this.recuperoStore.openModalCreate();
    }

    protected onViewDetail(item: LiquidacionRecuperoResponse) {
        this.recuperoDetalleStore.clearAll();
        this.router.navigate([item.id], { relativeTo: this.route });
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
