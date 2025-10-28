import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Estado } from '@/utils/Constants';
import { Helper } from '@/utils/Helper';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { PrimeModules } from '@/utils/PrimeModule';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbHeader } from '@/layout/component/breadcrumb/breadcrumb.header';
import type { DTOPartida } from '../../entities/partida/DTOPartida';
import { PartidaStore } from '../../stores/PartidaStore';
import { PartidaDetalleStore } from '../../stores/PartidaDetalleStore';
import { DTOUpdatePartida } from '../../entities/partida/DTOUpdatePartida';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';
import { PartidaCreateComponent } from "../create/partida-create.component";
import { PartidaEditComponent } from "../edit/partida-edit.component";

@Component({
    selector: 'partida-list',
    standalone: true,
    imports: [CommonModule, FormsModule, PrimeModules, FormatCurrencyPipe /*, RemanufacturaCreateComponent, EditComponent*/, BreadcrumbHeader, PartidaCreateComponent, PartidaEditComponent],
    templateUrl: './partida-list.component.html',
    providers: [MessageService, ConfirmationService]
})
export class PartidaListComponent implements OnInit {
    breadcrumbs = [{ label: 'Partida' }];

    productDialog: boolean = false;
    liquidaciones = signal<DTOPartida[]>([]);
    submitted = signal<boolean>(false);
    statuses!: any[];
    @ViewChild('dt') dt!: Table;

    partidaStore = inject(PartidaStore);
    partidaDetalleStore = inject(PartidaDetalleStore);

    confirmationService = inject(ConfirmationService);
    router = inject(Router);
    route = inject(ActivatedRoute);

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.partidaStore.list(Estado.Todos);
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openCreateModal() {
        this.partidaStore.openModalCreate();
    }

    OnEditModal(entity: any) {
        if (entity) {
            this.partidaStore.openModalEdit(entity as DTOUpdatePartida);
        }
    }

    onViewDetail(liquidacion: any) {
        this.partidaStore.clear();
        this.router.navigate([liquidacion.id], { relativeTo: this.route });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted.set(false);
    }

    onDeleteModal(liquidacion: DTOPartida) {
        this.confirmationService.confirm({
            message: `Estas seguro que desea eliminar ${liquidacion.partidaNombre} ?`,
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {
                label: 'Eliminar',
                severity: 'danger'
            },
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                text: true
            },
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            accept: () => {
                this.partidaStore.delete(liquidacion.id);
            },
            reject: () => {
                console.log('ERROR');
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
