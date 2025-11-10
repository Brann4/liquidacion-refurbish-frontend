import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import {  MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { DTOLiquidacionRemanufactura } from '../../entities/remanufactura/DTOLiquidacionRemanufactura';
import { RemanufacturaStore } from '../../stores/RemanufacturaStore';
import { Helper } from '@/utils/Helper';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { PrimeModules } from '@/utils/PrimeModule';
import { RemanufacturaCreateComponent } from '../create/remanufactura-create.component';
import { DTOUpdateLiquidacionRemanufactura } from '../../entities/remanufactura/DTOUpdateLiquidacionRemanufactura';
import { EditComponent } from '../edit/remanufactura-edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbHeader } from '@/layout/component/breadcrumb/breadcrumb.header';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { RemanufacturaDetalleStore } from '@/pages/remanufactura-detalle/stores/RemanufacturaDetalleStore';

@Component({
    selector: 'remanufactura-list',
    standalone: true,
    imports: [CommonModule, FormsModule, PrimeModules, ShortDatePipe, RemanufacturaCreateComponent, EditComponent, BreadcrumbHeader],
    templateUrl: './remanufactura-list.component.html'
})
export class RemanufacturaListComponent implements OnInit {
    breadcrumbs = signal<MenuItem[]>([{ label: 'Remanufactura' }]);
    confirmationDialogService = inject(ConfirmationDialog);

    productDialog: boolean = false;
    liquidaciones = signal<DTOLiquidacionRemanufactura[]>([]);
    submitted = signal<boolean>(false);
    statuses!: any[];
    @ViewChild('dt') dt!: Table;

    remanufacturaStore = inject(RemanufacturaStore);
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);
    router = inject(Router);
    route = inject(ActivatedRoute);

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.remanufacturaStore.getLiquidaciones(Estado.Todos);
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openCreateModal() {
        this.remanufacturaStore.openModalCreate();
    }

    OnEditModal(liquidacion: any) {
        if (liquidacion) {
            this.remanufacturaStore.openModalEdit(liquidacion as DTOUpdateLiquidacionRemanufactura);
        }
    }

    onViewDetail(liquidacion: DTOLiquidacionRemanufactura) {
        this.remanufacturaStore.clear();
        this.router.navigate([liquidacion.id], { relativeTo: this.route });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted.set(false);
    }

    onDeleteModal(liquidacion: DTOLiquidacionRemanufactura) {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.remanufacturaStore.delete(liquidacion.id);
            }
        });
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.liquidaciones().length; i++) {
            if (this.liquidaciones()[i].id == id) {
                index = i;
                break;
            }
        }
        return index;
    }

    getSeverity(status: number) {
        return Helper.setStatus(status);
    }
}
