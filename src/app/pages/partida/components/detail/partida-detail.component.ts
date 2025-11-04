import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Helper } from '@/utils/Helper';
import { ToastService } from '@/layout/service/toast.service';
import { FileUpload } from 'primeng/fileupload';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { PartidaStore } from '../../stores/PartidaStore';
import { PartidaDetalleStore } from '../../stores/PartidaDetalleStore';
import { Estado } from '@/utils/Constants';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';
import { DTOUpdatePartidaItem } from '../../entities/partidaItem/DTOUpdatePartidaItem';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { DTOPartidaItem } from '../../entities/partidaItem/DTOPartidaItem';
import { PartidaDetailCreate } from './create-detail/partida-detail-create.component';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';

@Component({
    selector: 'partida-detail',
    standalone: true,
    imports: [PrimeModules, FormatCurrencyPipe, CommonModule, FormsModule, PartidaDetailCreate],
    templateUrl: './partida-detail.component.html',
    styleUrl: './partida-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService]
})
export class PartidaDetailComponent implements OnInit {
    breadcrumbs = [{ label: 'Remanufactura' }];

    route = inject(ActivatedRoute);
    router = inject(Router);
    partidaStore = inject(PartidaStore);
    partidaDetalleStore = inject(PartidaDetalleStore);

    toast = inject(ToastService);
    confirmationDialogService = inject(ConfirmationDialog);

    showImportDialog = signal<boolean>(false);
    loadingImport = signal<boolean>(false);
    @ViewChild('fileUploader') fileUploader?: FileUpload;

    statuses!: SelectItem[];
    clonedProducts: { [s: number]: DTOPartidaItem } = {};

    unidadesMedida = signal<{ label: string; value: string }[]>([
        { label: 'MOVIMIENTO', value: 'Mov' },
        { label: 'PERSONA', value: 'Persona' },
        { label: 'DÍA', value: 'dia' },
        { label: 'HORAS', value: 'hrs' },
        { label: 'UNIDAD', value: 'und' }
    ]);

    constructor() {
        effect(() => {
            const entity = this.partidaStore.entity();
            if (entity) {
                if (entity?.id) {
                    this.partidaDetalleStore.getDetailData(entity.id, Estado.Todos);
                }
            }
        });
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) this.partidaStore.getById(id);

        this.statuses = [
            { label: 'Activo', value: true },
            { label: 'Inactivo', value: false }
        ];
    }

    goBack() {
        this.partidaStore.clear();
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    handleToggleImport() {
        this.showImportDialog.set(!this.showImportDialog());
    }

    getSeverity(status: number | boolean) {
        return Helper.setStatus(status);
    }

    clearFilters(table: Table) {
        table.clear();
        table.filterGlobal('', '');
    }

    onDeleteModal(data: DTOPartidaItem) {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.partidaDetalleStore.delete(data, this.partidaStore.entity()!.id);
            }
        });
    }

    onRowEditInit(data: DTOPartidaItem) {
        this.clonedProducts[data.id] = { ...data };
    }

    onRowEditSave(data: DTOUpdatePartidaItem) {
        if (data) {
            delete this.clonedProducts[data.id];
            data.fechaModificacion = new Date(); //Ingresar fecha manualmente
            this.partidaDetalleStore.update(data);
        } else {
            this.toast.warn('No debe existir ningun dato vacio');
        }
    }

    onRowEditCancel(data: DTOPartidaItem, index: number) {
        this.partidaDetalleStore.entities()[index] = this.clonedProducts[data.id];
        delete this.clonedProducts[data.id];
        this.partidaDetalleStore.getDetailData(this.partidaStore.entity()!.id, Estado.Activo);
    }

    openCreateModal() {
        this.partidaDetalleStore.openModalCreate();
    }
}
