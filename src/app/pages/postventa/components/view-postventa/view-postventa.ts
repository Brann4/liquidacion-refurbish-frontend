import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { PrimeModules } from '@/utils/PrimeModule';
import { PostventaStore } from '@/pages/postventa/stores/postventa.store';
import { PostVentaDetalleStore } from '@/pages/postventa-detalle/stores/PostVentaDetalleStore';
import { PostventaModal } from '@/pages/postventa/components/postventa-modal/postventa-modal';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { LiquidacionPostventaResponse } from '@/pages/postventa/entities/liquidacion-postventa-response';
import { mapResponseToLiquidacionPostventa } from '@/pages/postventa/mappers/postventa.mapper';
import { BreadcrumbHeader } from '@/layout/component/breadcrumb/breadcrumb.header';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { EstadoLiquidacion } from '@/utils/estado-liquidacion';

@Component({
    selector: 'app-view-postventa',
    imports: [PrimeModules, PostventaModal, BreadcrumbHeader, ShortDatePipe],
    templateUrl: './view-postventa.html',
    styles: ``
})
export class ViewPostventa implements OnInit {
    private readonly postventaStore = inject(PostventaStore);
    private readonly postventaDetalleStore = inject(PostVentaDetalleStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private confirmationDialogService = inject(ConfirmationDialog);
    protected readonly postventas = computed(() => this.postventaStore.entities());
    protected readonly isLoadingEntities = computed(() => this.postventaStore.isLoadingEntities());
    protected readonly breadcrumbs = [{ label: 'Postventa' }];

    ngOnInit(): void {
        this.loadPostventas();
    }

    protected loadPostventas(): void {
        this.postventaStore.getAll();
    }

    protected openCreateModal(): void {
        this.postventaStore.openModalCreate();
    }

    protected onViewDetail(item: LiquidacionPostventaResponse) {
        this.postventaDetalleStore.clear();
        this.router.navigate([item.id], { relativeTo: this.route });
    }

    protected onEditPostventa(postventa: LiquidacionPostventaResponse): void {
        this.postventaStore.openModalEdit(mapResponseToLiquidacionPostventa(postventa));
    }

    protected onDeletePostventa(postventa: LiquidacionPostventaResponse): void {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.postventaStore.delete(postventa.id);
            }
        });
    }

    protected onGlobalFilter(event: Event, dataTable: Table): void {
        const target = event.target as HTMLInputElement | null;
        const filterValue = target?.value ?? '';
        dataTable.filterGlobal(filterValue, 'contains');
    }

    protected getEstadoLabel(estado: EstadoLiquidacion): string {
        return estado === EstadoLiquidacion.Pendiente ? 'Pendiente' : 'Importado';
    }

    protected getEstadoSeverity(estado: EstadoLiquidacion): 'warning' | 'success' {
        return estado === EstadoLiquidacion.Pendiente ? 'warning' : 'success';
    }
}
