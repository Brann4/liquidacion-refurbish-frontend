import * as XLSX from 'xlsx';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { DTOLiquidacionRemanufacturaDetalle } from '../../entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';

@Component({
    selector: 'remanufactura-detail',
    standalone: true,
    imports: [PrimeModules, ShortDatePipe],
    templateUrl: './remanufactura-detail.component.html',
    styleUrl: './remanufactura-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemanufacturaDetailComponent implements OnInit {
    breadcrumbs = [{ label: 'Remanufactura' }];

    route = inject(ActivatedRoute);
    router = inject(Router);
    remanufacturaStore = inject(RemanufacturaStore);
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);
    remanufacturaDetalleService = inject(RemanufacturaDetalleService);

    toast = inject(ToastService);
    confirmationDialogService = inject(ConfirmationDialog);

    showImportDialog = signal<boolean>(false);
    loadingImport = computed(() => this.remanufacturaDetalleStore.isExporting());
    statusActive = computed(() => !!this.remanufacturaStore.entity()?.estado);

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
        this.verifyStatus();
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) this.remanufacturaStore.getById(id);
    }

    goBack() {
        this.remanufacturaDetalleStore.cancelGetDetailData();
        this.remanufacturaDetalleStore.clear();
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    handleToggleImport(entityStatus?: boolean) {
        if (entityStatus) {
            this.showImportDialog.set(!this.showImportDialog());
        } else {
            this.toast.warn('La liquidacion debe de estar activada');
        }
    }

    getSeverity(status: boolean) {
        return Helper.setStatus(status);
    }

    downloadExcelTemplate() {
        console.log('descargaando template');
    }

    handleImportAgain() {
        this.remanufacturaDetalleStore.clear();
        this.showImportDialog.set(true);
    }

    private ValidateHeaders(headers: string[], expectedHeaders: string[]): string[] {
        const missingHeaders = expectedHeaders.filter((header) => !headers.map((h) => h.toLowerCase().trim().includes(h)));
        if (missingHeaders.length > 0) {
            this.toast.warn(`Error: Faltan las columnas: ${missingHeaders.join(', ')}`);
            this.remanufacturaDetalleStore.setExportingPreview(false);
            return [];
        }

        return missingHeaders;
    }

    async handleUploadFile(event: { files: File[] }): Promise<void> {
        const file = event.files[0];
        const nombreLiquidacion = this.remanufacturaStore.entity()?.nombreLiquidacion;

        if (!file || !nombreLiquidacion) {
            this.toast.error('Falta el archivo o no se ha cargado la liquidación.');
            return;
        }

        try {
            this.remanufacturaDetalleStore.setExportingPreview(true);

            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            //Validacion de cabeceras
            const headers: string[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
            const headersArchivo = headers.map((h) => this.parseString(h).toLowerCase());

            const missingHeaders = headersArchivo.filter((_) => !headers.map((h) => h.toLowerCase().trim().includes(h)));
            if (missingHeaders.length > 0) {
                this.toast.warn(`Error: Faltan las columnas: ${missingHeaders.join(', ')}`);
                this.remanufacturaDetalleStore.setExportingPreview(false);
                return;
            }

            const normalizedHeaders = headersArchivo.map((header) =>
                header
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '')
                    .replace(/[^\w]/g, '')
            );

            var previewData = this.normalizarFilas(worksheet, normalizedHeaders);

            for (let index = 0; index < previewData.length; index++) {
                const element = previewData[index];
                if (element.liquidacion !== nombreLiquidacion) {
                    /* if(previewData.length-1 === index){
                        this.toast.error(`La liquidación '${element.liquidacion}' en la fila ${index+2} no coincide con la esperada '${nombreLiquidacion}'.`);
                    }else{*/
                    this.toast.error(`La liquidación '${element.liquidacion}' en la fila ${index + 2} no coincide con la esperada '${nombreLiquidacion}'.`);
                    //}
                    this.remanufacturaDetalleStore.setExportingPreview(false);
                    return;
                }
            }

            this.remanufacturaDetalleStore.setEntityPreview(previewData);
            this.remanufacturaDetalleStore.setExportingPreview(false);
        } catch (error) {
            this.toast.error('Error al procesar el archivo.');
            this.remanufacturaDetalleStore.setExportingPreview(false);
        }

        const formData = new FormData();
        formData.append('File', file, file.name);
        formData.append('liquidacion', nombreLiquidacion);

        this.showImportDialog.set(false);
    }

    private normalizarFilas(worksheet: XLSX.WorkSheet, expectedHeaders: string[]) {
        const normalizedHeaders = expectedHeaders.map((header) =>
            header
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '')
                .replace(/[^\w]/g, '')
        );

        const previewData: any[] = XLSX.utils
            .sheet_to_json(worksheet, {
                header: normalizedHeaders, // Mapea cabeceras a DTO
                range: 1, // Empieza desde la segunda fila (índice 1)
                defval: null // Para celdas vacías
            })
            .slice(0, 15000);

        const headerMap: Record<string, keyof DTOLiquidacionRemanufacturaDetalle> = {
            idliq: 'codigoLiquidacion',
            plataforma: 'plataforma',
            liquidacion: 'liquidacion',
            codigodeentrega: 'codigoEntrega',
            fechaprevista: 'fechaPrevista',
            codsap: 'codigoSAP',
            brevedescripcion: 'nombreProducto',
            qty: 'cantidad',
            um: 'unidadMedida',
            serieorgen: 'serieOrigen',
            seriefinal: 'serieFinal',
            trabajorealizado: 'trabajoRealizado',
            estado: 'estado',
            componentes: 'componentes',
            costounitario: 'costoUnitario',
            costototal: 'costoTotal',
            motivoentrega: 'motivoEntrega',
            guiaingreso: 'guiaIngreso',
            guiasalida: 'guiaSalida',
            status_sap: 'estadoSAP',
            ordendecompra: 'ordenDeCompra',
            contabilizado: 'contabilizado',
            pedido: 'pedido',
            reingreso: 'reingreso'
        };

        const mappedData: DTOLiquidacionRemanufacturaDetalle[] = previewData.map((item) => {
            const result: Partial<DTOLiquidacionRemanufacturaDetalle> = {};

            for (const [oldKey, newKey] of Object.entries(headerMap)) {
                let value = item[oldKey];

                if (['codigoLiquidacion', 'pedido', 'contabilizado', 'codigoSAP'].includes(newKey)) {
                    value = String(value);
                }

                // Conversión de tipos (opcional pero recomendable)
                if (newKey === 'fechaPrevista' && value) {
                    value = new Date(value as string);
                }

                if (['cantidad', 'costoUnitario', 'costoTotal', 'reingreso'].includes(newKey)) {
                    value = Number(value) || 0;
                }
                // @ts-ignore (porque los keys son dinámicos)
                result[newKey] = value;
            }

            return result as DTOLiquidacionRemanufacturaDetalle;
        });

        return mappedData;
    }

    verifyStatus() {
        return !!this.remanufacturaStore.entity()?.estado;
    }

    handleSubmitDetail() {
        this.confirmationDialogService.confirmSave().subscribe((accepted) => {
            if (accepted) {
                const payload = {
                    detalles: this.remanufacturaDetalleStore.entityPreview()
                };
                this.remanufacturaDetalleStore.createDetail(payload);
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

    getFileSizeInMB(sizeKB: number): string {
        if (!sizeKB) return '0 MB';
        const sizeMB = sizeKB / (1024 * 1024);
        return `${sizeMB.toFixed(2)} MB`;
    }

    /**
     * Parsea un valor a string de forma segura.
     * (Equivalente a ParseCellValue<string>)
     */
    private parseString(value: any): string {
        if (value === null || value === undefined) {
            return ''; // Devuelve string vacío para nulos
        }
        return String(value).trim();
    }

    /**
     * Parsea un valor a entero de forma segura.
     * Lanza un error si no es un número entero válido.
     * (Equivalente a ParseCellValue<int>)
     */
    private parseIntSafe(value: any, columnName: string): number {
        if (value === null || value === undefined || String(value).trim() === '') {
            // C# Convert.ChangeType fallaría, así que lanzamos un error
            throw new Error(`Columna '${columnName}' no puede estar vacía.`);
        }

        const strValue = String(value).trim();

        const numValue = parseFloat(strValue);

        if (isNaN(numValue) || !Number.isInteger(numValue)) {
            throw new Error(`Columna '${columnName}': El valor '${strValue}' no es un número entero válido.`);
        }

        return numValue;
    }

    /**
     * Parsea un valor a decimal de forma segura.
     * Lanza un error si no es un número válido.
     * (Equivalente a ParseCellValue<decimal>)
     */
    private parseFloatSafe(value: any, columnName: string): number {
        if (value === null || value === undefined || String(value).trim() === '') {
            // Asumimos que los decimales pueden ser 0, pero no vacíos
            throw new Error(`Columna '${columnName}' no puede estar vacía.`);
        }

        const strValue = String(value).trim().replace(',', '.');

        const floatValue = parseFloat(strValue);

        if (isNaN(floatValue)) {
            throw new Error(`Columna '${columnName}': El valor '${strValue}' no es un número decimal válido.`);
        }

        return floatValue;
    }
}
