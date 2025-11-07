import { PartidaRemanufacturaDetalleStore } from './../../stores/PartidaRemanufacturaDetalleStore';
import * as XLSX from 'xlsx';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { Estado } from '@/utils/Constants';
import { Table } from 'primeng/table';
import { Helper } from '@/utils/Helper';
import { ToastService } from '@/layout/service/toast.service';
import { FileUpload } from 'primeng/fileupload';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { RemanufacturaStore } from '@/pages/remanufactura/stores/RemanufacturaStore';
import { DTOLiquidacionRemanufactura } from '@/pages/remanufactura/entities/remanufactura/DTOLiquidacionRemanufactura';
import { RemanufacturaDetalleStore } from '../../stores/RemanufacturaDetalleStore';
import { SortEvent } from 'primeng/api';
import { DTOLiquidacionRemanufacturaDetalle } from '@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { RemanufacturaPartidasDetailComponent } from '../partidas-detail/partidas-detail.component';
import { PartidaStore } from '@/pages/partida/stores/PartidaStore';
import { enIE } from 'date-fns/locale';
import { DTOCreateRemanufacturaDetalle } from '../../entities/remanufactura-detalle/DTOCreateRemanufacturaDetalle';

@Component({
    selector: 'remanufactura-detail',
    standalone: true,
    imports: [PrimeModules, ShortDatePipe, RemanufacturaPartidasDetailComponent],
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
    partidaStore = inject(PartidaStore);
    partidaDetalleStore = inject(PartidaRemanufacturaDetalleStore);

    toast = inject(ToastService);
    confirmationDialogService = inject(ConfirmationDialog);

    showImportDialog = signal<boolean>(false);
    isSorted = signal<boolean | null>(null);
    selectedData!: DTOLiquidacionRemanufacturaDetalle[] | null;

    detalles = signal<DTOLiquidacionRemanufacturaDetalle[]>([]);
    initialValue = signal<DTOLiquidacionRemanufacturaDetalle[]>([]);

    protected readonly liquidacionRemanufacturaId = signal<number | null>(null);

    loadingImport = computed(() => this.remanufacturaDetalleStore.isExporting());
    statusActive = computed(() => !!this.remanufacturaStore.entity()?.estado);

    @ViewChild('fileUploader') fileUploader?: FileUpload;
    @ViewChild('dt') dt!: Table;

    constructor() {
        effect(() => {
            const entity = this.remanufacturaStore.entity();
            if (entity) {
                this.loadDetailData(entity);
                if (!this.remanufacturaDetalleStore.isSubmitting() && this.fileUploader?.hasFiles()) {
                    this.fileUploader.clear();
                }
            }
        });
        this.verifyStatus();
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.remanufacturaStore.getById(id);
            this.liquidacionRemanufacturaId.set(id);
            this.detalles.set(this.remanufacturaDetalleStore.entities());
            this.initialValue.set([...this.remanufacturaDetalleStore.entities()]);
        }
    }

    private loadDetailData(entity: DTOLiquidacionRemanufactura) {
        this.remanufacturaDetalleStore.getDetailData(entity.id, Estado.Activo);
    }

    goBack() {
        this.remanufacturaDetalleStore.cancelGetDetailData();
        this.remanufacturaDetalleStore.clear();
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value.trim(), 'contains');
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

    customSort(event: SortEvent) {
        if (this.isSorted() == null || this.isSorted() === undefined) {
            this.isSorted.set(true);
            this.sortTableData(event);
        } else if (this.isSorted() == true) {
            this.isSorted.set(false);
            this.sortTableData(event);
        } else if (this.isSorted() == false) {
            this.isSorted.set(null);
            this.detalles.set([...this.initialValue()]);
            this.dt.reset();
        }
    }

    sortTableData(event: SortEvent) {
        if (!event.data || !event.field || !event.order) {
            console.warn('SortEvent no contiene los datos necesarios para ordenar.');
            return;
        }

        event.data.sort((data1: any, data2: any) => {
            let value1 = data1[event.field!];
            let value2 = data2[event.field!];
            let result = null;
            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order! * result;
        });
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

            var { mappedData, validationErrors } = this.normalizarFilas(worksheet, normalizedHeaders);

            for (let index = 0; index < mappedData.length; index++) {
                const element = mappedData[index];
                if (element.liquidacion !== nombreLiquidacion) {
                    this.toast.error(`La liquidación '${element.liquidacion}' en la fila ${index + 2} no coincide con la esperada '${nombreLiquidacion}'.`);
                    this.remanufacturaDetalleStore.setExportingPreview(false);
                    return;
                }
            }

            if (validationErrors.length > 0) {
                const errorsToShow = validationErrors.slice(0, 10).join('\n');
                this.toast.error(`El archivo contiene ${validationErrors.length} errores de formato.\n${errorsToShow}`);
                this.remanufacturaDetalleStore.setExportingPreview(false);
                return; // Detiene el proceso
            }

            if (mappedData.length === 0) {
                this.toast.warn('El archivo no contiene filas de datos válidas.');
                this.remanufacturaDetalleStore.setEntityPreview([]);
                return;
            }
            this.toast.success(`Se han previsualizado ${mappedData.length} registros correctamente.`);
            this.remanufacturaDetalleStore.setEntityPreview(mappedData);
            this.remanufacturaDetalleStore.setExportingPreview(false);
        } catch (error) {
            this.toast.error('Error al procesar el archivo.');
            this.remanufacturaDetalleStore.setExportingPreview(false);
        }

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
            .slice(0, 20000);

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

        const mappedData: DTOLiquidacionRemanufacturaDetalle[] = [];
        const validationErrors: string[] = [];

        for (let i = 0; i < previewData.length; i++) {
            const item = previewData[i]; // E.g., { idliq: 1, qty: "5", ... }
            const excelRowNumber = i + 2; // Fila 1 es cabecera
            const result: Partial<DTOLiquidacionRemanufacturaDetalle> = {};

            try {
                // Itera sobre el mapa de claves
                for (const [normalizedKey, dtoKey] of Object.entries(headerMap)) {
                    const rawValue = item[normalizedKey];

                    // *** AQUÍ OCURRE LA VALIDACIÓN DE TIPOS ***
                    switch (dtoKey) {
                        case 'cantidad':
                        case 'reingreso':
                            // @ts-ignore
                            result[dtoKey] = this.parseIntSafe(rawValue, normalizedKey);
                            break;
                        case 'costoUnitario':
                        case 'costoTotal':
                            // @ts-ignore
                            result[dtoKey] = this.parseFloatSafe(rawValue, normalizedKey);
                            break;
                        case 'fechaPrevista':
                            result[dtoKey] = this.parseISODate(rawValue, normalizedKey);
                            break;
                        default:
                            // Todos los demás son strings (fechas, etc.)
                            // @ts-ignore
                            result[dtoKey] = this.parseString(rawValue);
                    }
                }

                mappedData.push(result as DTOLiquidacionRemanufacturaDetalle);
            } catch (err: any) {
                // Captura el error de parseIntSafe/parseFloatSafe
                validationErrors.push(`Fila ${excelRowNumber}: ${err.message}`);
            }
        }

        return { mappedData, validationErrors };
    }

    verifyStatus() {
        return !!this.remanufacturaStore.entity()?.estado;
    }

    handleSubmitDetail() {
        this.confirmationDialogService.confirmSave().subscribe((accepted) => {
            if (accepted) {
                const idLiquidacion = this.liquidacionRemanufacturaId();
                const entitiesPreview = this.remanufacturaDetalleStore.entitiesPreview();

                if (idLiquidacion && entitiesPreview.length > 0) {
                    const request: DTOCreateRemanufacturaDetalle = {
                        liquidacionRemanufacturaId: idLiquidacion,
                        detalles: entitiesPreview.map((item) => ({
                            codigoLiquidacion: item.codigoLiquidacion,
                            plataforma: item.plataforma,
                            liquidacion: item.liquidacion,
                            codigoEntrega: item.codigoEntrega,
                            fechaPrevista: item.fechaPrevista,
                            codigoSAP: item.codigoSAP,
                            nombreProducto: item.nombreProducto,
                            cantidad: item.cantidad,
                            unidadMedida: item.unidadMedida,
                            serieOrigen: item.serieOrigen,
                            serieFinal: item.serieFinal,
                            trabajoRealizado: item.trabajoRealizado,
                            estado: item.estado,
                            componentes: item.componentes,
                            costoUnitario: item.costoUnitario,
                            costoTotal: item.costoTotal,
                            motivoEntrega: item.motivoEntrega,
                            guiaIngreso: item.guiaIngreso,
                            guiaSalida: item.guiaSalida,
                            estadoSAP: item.estadoSAP,
                            ordenDeCompra: item.ordenDeCompra,
                            contabilizado: item.contabilizado,
                            pedido: item.pedido,
                            reingreso: item.reingreso
                        }))
                    };

                    this.remanufacturaDetalleStore.create(request);
                }
            }
        });
    }

    export() {
        const idLiquidacion = this.liquidacionRemanufacturaId();
        if (!idLiquidacion) return this.toast.warn('No hay una liquidación seleccionada.');
        this.remanufacturaDetalleStore.exportDataTable(idLiquidacion);
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
    deleteSelectedProducts() {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            const idLiquidacion = this.liquidacionRemanufacturaId();

            if (!accepted || !this.selectedData?.length) return;

            const allSelected = this.selectedData?.length === this.remanufacturaDetalleStore.entities().length;

            if (accepted) {
                if (allSelected) {
                    this.remanufacturaDetalleStore.deleteAll(idLiquidacion!);
                } else {
                    const itemsIdSelected = this.selectedData.map((x) => x.id);
                    this.remanufacturaDetalleStore.deleteMany(idLiquidacion!, itemsIdSelected);
                }
                this.selectedData = null;
            }
        });
    }

    private parseString(value: any): string {
        if (value === null || value === undefined) {
            return ''; // Devuelve string vacío para nulos
        }
        return String(value).trim();
    }
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

    private parseISODate(value: any, columnName: string) {
        if (value === null || value === undefined || String(value).trim() === '') {
            // Asumimos que los decimales pueden ser 0, pero no vacíos
            throw new Error(`Columna '${columnName}' no puede estar vacía.`);
        }
        return Helper.formatExcelDate(value);
    }

    handleOpenModalAddPartidas(idLiquidacion: number | null) {
        if (idLiquidacion == null) return;
        this.partidaDetalleStore.openModalManagment(idLiquidacion);
    }
}
