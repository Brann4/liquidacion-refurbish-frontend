import * as XLSX from 'xlsx';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { Table } from 'primeng/table';
import { Helper } from '@/utils/Helper';
import { ToastService } from '@/layout/service/toast.service';
import { FileUpload } from 'primeng/fileupload';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { DTOLiquidacionRemanufacturaDetalle } from '@/pages/remanufactura-detalle/entities/remanufactura-detalle/DTOLiquidacionRemanufacturaDetalle';
import { PostVentaDetalleStore } from '../../stores/PostVentaDetalleStore';
import { PostventaStore } from '@/pages/postventa/stores/postventa.store';
import { DTOLiquidacionPostVentaDetalle } from '../../entities/postventa-detalle/DTOPostVentaDetalle';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';
import { DTOCreatePostVentaDetalle } from '../../entities/postventa-detalle/DTOCreatePostVentaDetalle';

@Component({
    selector: 'postventa-detail',
    standalone: true,
    imports: [PrimeModules, ShortDatePipe, FormatCurrencyPipe],
    templateUrl: './postventa-detail.component.html',
    styleUrl: './postventa-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostVentaDetailComponent implements OnInit {
    breadcrumbs = [{ label: 'Remanufactura' }];

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    postventaDetalleStore = inject(PostVentaDetalleStore);
    postventaStore = inject(PostventaStore);

    protected readonly liquidacionPostventaId = signal<number | null>(null);

    detalles = signal<DTOLiquidacionPostVentaDetalle[]>([]);

    toast = inject(ToastService);
    confirmationDialogService = inject(ConfirmationDialog);

    showImportDialog = signal<boolean>(false);
    isSorted = signal<boolean | null>(null);
    selectedData!: DTOLiquidacionRemanufacturaDetalle[] | null;

    @ViewChild('fileUploader') fileUploader?: FileUpload;
    @ViewChild('dt') dt!: Table;

    constructor() {
        effect(() => {
            const entity = this.postventaStore.entity();
            if (entity) {
                this.loadContrata(entity.contrataId);
                this.postventaDetalleStore.getDetailData(entity.id);

                if (!this.postventaDetalleStore.isSubmitting() && this.fileUploader?.hasFiles()) {
                    this.fileUploader.clear();
                }
            }
        });
        this.verifyStatus();
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.postventaStore.getById(id); //para carga de datos al recargar la pagina
            this.liquidacionPostventaId.set(id);
        }
    }
    protected loadContrata(contrataId: number): void {
        this.postventaDetalleStore.getContrataById(contrataId);
    }

    goBack() {
        this.postventaDetalleStore.cancelGetDetailData();
        this.postventaDetalleStore.clear();
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value.trim(), 'contains');
    }

    handleToggleImport(entityStatus?: boolean | number) {
        if (entityStatus) {
            this.showImportDialog.set(!this.showImportDialog());
        } else {
            this.toast.warn('La liquidacion debe de estar activada');
        }
    }

    getSeverity(status: boolean | number) {
        return Helper.setStatus(status);
    }

    downloadExcelTemplate() {
        console.log('descargaando template');
    }

    handleImportAgain() {
        this.postventaDetalleStore.clear();
        this.showImportDialog.set(true);
    }

    async handleUploadFile(event: { files: File[] }): Promise<void> {
        const file = event.files[0];
        const fechaLiquidacionPostventa = this.postventaStore.entity()!.fechaIngreso;
        const contratistaLiquidacion = this.postventaDetalleStore.contrata()!.razonSocial;

        if (!file || !fechaLiquidacionPostventa || !contratistaLiquidacion) {
            this.toast.error('Falta el archivo o no se ha cargado la liquidación.');
            return;
        }

        try {
            this.postventaDetalleStore.setExportingPreview(true);

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
                this.postventaDetalleStore.setExportingPreview(false);
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
                const stringYearData = fechaLiquidacionPostventa.slice(0, 4);
                const stringDayData = fechaLiquidacionPostventa.slice(5, 7);
                const rowDate = `${stringYearData}${stringDayData}`;

                if (rowDate != element.mesPago) {
                    this.toast.error(`La liquidación '${element.mesPago}' en la fila ${index + 2} no coincide con la esperada '${rowDate}'.`);
                    this.postventaDetalleStore.setExportingPreview(false);
                    return;
                }

                /* if (contratistaLiquidacion.trim().toLowerCase() != element.contratista.trim().toLowerCase()) {
                    this.toast.error(`El contratista '${element.contratista}' en la fila ${index + 2} no coincide con el contratista de esta liquidación.`);
                    this.postventaDetalleStore.setExportingPreview(false);
                    return;
                }*/
            }

            if (validationErrors.length > 0) {
                const errorsToShow = validationErrors.slice(0, 10).join('\n');
                this.toast.error(`El archivo contiene ${validationErrors.length} errores de formato.\n${errorsToShow}`);
                this.postventaDetalleStore.setExportingPreview(false);
                return; // Detiene el proceso
            }

            if (mappedData.length === 0) {
                this.toast.warn('El archivo no contiene filas de datos válidas.');
                this.postventaDetalleStore.setEntityPreview([]);
                return;
            }

            this.toast.success(`Se han previsualizado ${mappedData.length} registros correctamente.`);
            this.postventaDetalleStore.setEntityPreview(mappedData);
            this.postventaDetalleStore.setExportingPreview(false);
        } catch (error) {
            this.toast.error('Error al procesar el archivo.');
            this.postventaDetalleStore.setExportingPreview(false);
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

        const headerMap: Record<string, keyof DTOLiquidacionPostVentaDetalle> = {
            fecha_carga: 'fechaCarga',
            tipo_liquidacion: 'tipoLiquidacion',
            cod_sap: 'codigoSAP',
            contratista: 'contratista',
            departamento: 'departamento',
            sot: 'codigoSOT',
            fecha_instalacion: 'fechaInstalacion',
            codigo_actividad: 'codigoActividad',
            actividad: 'actividadDescripcion',
            cantidad: 'cantidad',
            costo: 'costo',
            total: 'total',
            tipo_trabajo: 'tipoTrabajo',
            servicio: 'servicio',
            oc: 'ordenCompra',
            mes_pago: 'mesPago'
        };

        const mappedData: DTOLiquidacionPostVentaDetalle[] = [];
        const validationErrors: string[] = [];

        for (let i = 0; i < previewData.length; i++) {
            const item = previewData[i]; // E.g., { idliq: 1, qty: "5", ... }
            const excelRowNumber = i + 2; // Fila 1 es cabecera
            const result: Partial<DTOLiquidacionPostVentaDetalle> = {};

            try {
                // Itera sobre el mapa de claves
                for (const [normalizedKey, dtoKey] of Object.entries(headerMap)) {
                    const rawValue = item[normalizedKey];

                    // *** AQUÍ OCURRE LA VALIDACIÓN DE TIPOS ***
                    switch (dtoKey) {
                        case 'cantidad':
                            // @ts-ignore
                            result[dtoKey] = this.parseIntSafe(rawValue, normalizedKey);
                            break;
                        case 'costo':
                        case 'total':
                            // @ts-ignore
                            result[dtoKey] = this.parseFloatSafe(rawValue, normalizedKey);
                            break;
                        case 'fechaCarga':
                        case 'fechaInstalacion':
                            // @ts-ignore
                            result[dtoKey] = this.parseISODate(rawValue, normalizedKey);
                            break;
                        default:
                            // @ts-ignore
                            result[dtoKey] = this.parseString(rawValue);
                    }
                }

                mappedData.push(result as DTOLiquidacionPostVentaDetalle);
            } catch (err: any) {
                // Captura el error de parseIntSafe/parseFloatSafe
                validationErrors.push(`Fila ${excelRowNumber}: ${err.message}`);
            }
        }

        return { mappedData, validationErrors };
    }

    verifyStatus() {
        return !!this.postventaStore.entity()?.estado;
    }

    handleSubmitDetail() {
        this.confirmationDialogService.confirmSave().subscribe((accepted) => {
            if (accepted) {
                const idLiquidacion = this.liquidacionPostventaId();
                const entitiesPreview = this.postventaDetalleStore.entitiesPreview();

                if (idLiquidacion && entitiesPreview.length > 0) {
                    const request: DTOCreatePostVentaDetalle = {
                        liquidacionPostventaId: idLiquidacion,
                        detalles: entitiesPreview.map((item) => ({
                            fechaCarga: item.fechaCarga,
                            tipoLiquidacion: item.tipoLiquidacion,
                            codigoSAP: item.codigoSAP,
                            contratista: item.contratista,
                            departamento: item.departamento,
                            codigoSOT: item.codigoSOT,
                            fechaInstalacion: item.fechaInstalacion,
                            codigoActividad: item.codigoActividad,
                            actividadDescripcion: item.actividadDescripcion,
                            cantidad: item.cantidad,
                            costo: item.costo,
                            total: item.total,
                            tipoTrabajo: item.tipoTrabajo,
                            servicio: item.servicio,
                            ordenCompra: item.ordenCompra,
                            mesPago: item.mesPago
                        }))
                    };

                    this.postventaDetalleStore.create(request);
                }
            }
        });
    }

    exportDataTable() {
        const nombre = this.postventaStore.entity()?.id;
        if (!nombre) return this.toast.warn('No hay una liquidación seleccionada.');
        this.postventaDetalleStore.export(nombre);
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
            if (!accepted || !this.selectedData?.length) return;

            const allSelected = this.selectedData?.length === this.postventaDetalleStore.entities().length;

            if (accepted) {
                if (allSelected) {
                    //this.postventaDetalleStore.deleteAll(this.postventaStore.entity()!.id);
                } else {
                    const itemsIdSelected = this.selectedData.map((x) => x.id);
                    //this.postventaDetalleStore.deleteMany(this.postventaStore.entity()!.id, itemsIdSelected);
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
}
