import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RemanufacturaStore } from '../../stores/RemanufacturaStore';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { RemanufacturaDetalleStore } from '../../stores/RemanufacturaDetalleStore';
import { Estado } from '@/utils/Constants';
import { Table } from 'primeng/table';
import { Helper } from '@/utils/Helper';
import { ToastService } from '@/layout/service/toast.service';
import { RemanufacturaDetalleService } from '../../services/remanufactura-detalle.service';
import { FileUpload } from 'primeng/fileupload';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'partida-detail',
    standalone: true,
    imports: [PrimeModules, ShortDatePipe],
    templateUrl: './partida-detail.component.html',
    styleUrl: './partida-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService]
})
export class RemanufacturaDetailComponent implements OnInit {
    breadcrumbs = [{ label: 'Remanufactura' }];

    route = inject(ActivatedRoute);
    router = inject(Router);
    remanufacturaStore = inject(RemanufacturaStore);
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);
    remanufacturaDetalleService = inject(RemanufacturaDetalleService);

    toast = inject(ToastService);
    confirmationService = inject(ConfirmationService);

    showImportDialog = signal<boolean>(false);
    loadingImport = signal<boolean>(false);
    @ViewChild('fileUploader') fileUploader?: FileUpload;

    constructor() {
        effect(() => {
            const entity = this.remanufacturaStore.entity();
            if (entity) {
                if (entity?.nombreLiquidacion) {
                    this.remanufacturaDetalleStore.getDetailData(entity.nombreLiquidacion, Estado.Activo);
                }

                if (!this.remanufacturaDetalleStore.isSubmitting() && this.fileUploader?.hasFiles()) {
                    this.fileUploader.clear();
                }
            }
        });
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) this.remanufacturaStore.getById(id);
    }

    goBack() {
        this.remanufacturaDetalleStore.clear();
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    handleToggleImport() {
        this.showImportDialog.set(!this.showImportDialog());
    }

    getSeverity(status: number) {
        return Helper.setStatus(status);
    }

    downloadExcelTemplate() {
        console.log('descargaando template');
    }

    handleImportAgain() {
        this.remanufacturaDetalleStore.clear();
        this.showImportDialog.set(true);
    }

    handleUploadFile(event: { files: File[] }): void {
        const file = event.files[0];
        const nombreLiquidacion = this.remanufacturaStore.entity()?.nombreLiquidacion;

        if (!file || !nombreLiquidacion) {
            this.toast.error('Falta el archivo o no se ha cargado la liquidación.');
            return;
        }
        this.loadingImport.set(true);

        const formData = new FormData();
        formData.append('File', file, file.name);
        formData.append('liquidacion', nombreLiquidacion);

        this.remanufacturaDetalleStore.previewData(formData);

        this.loadingImport.set(false);
        this.showImportDialog.set(false);
    }

    handleSubmitDetail() {
        this.confirmationService.confirm({
            message: `Estas seguro de guardar los datos ?`,
            header: 'Confirmación',
            icon: 'pi pi-question-circle',
            acceptButtonProps: {
                label: 'Confirmar'
            },
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                text: true
            },
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            accept: () => {
                console.log('ERNVIADO');
                /*PAYLOAD*/
                const payload = {
                    detalles: this.remanufacturaDetalleStore.entityPreview()
                };
                this.remanufacturaDetalleStore.createDetail(payload);
            },
            reject: () => {
                console.log('ERROR');
            }
        });
    }

    exportDataTable() {
        const nombre = this.remanufacturaStore.entity()?.nombreLiquidacion;
        if (!nombre) return this.toast.warn('No hay una liquidación seleccionada.');

        this.remanufacturaDetalleStore.exportDataTable(nombre);
    }

    clearFilters(table: Table) {
        table.clear();
        table.filterGlobal('', '');
    }
}
