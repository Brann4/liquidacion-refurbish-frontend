import * as XLSX from 'xlsx';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal, viewChild, ViewChild } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { ToastService } from '@/layout/service/toast.service';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { PostVentaDetalleStore } from '@/pages/postventa-detalle/stores/PostVentaDetalleStore';
import { DTOLiquidacionPostVentaDetalle } from '@/pages/postventa-detalle/entities/postventa-detalle/DTOPostVentaDetalle';
import { DTOCreatePostVentaDetalle } from '@/pages/postventa-detalle/entities/postventa-detalle/DTOCreatePostVentaDetalle';
import { DeleteLiquidacionPostventaDetalleByIdsRequest } from '@/pages/postventa-detalle/entities/delete-liquidacion-postventa-detalle-by-ids-request';
import { EstadoLiquidacion } from '@/utils/estado-liquidacion';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';
import { Helper } from '@/utils/Helper';
import { PrimeModules } from '@/utils/PrimeModule';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
    selector: 'postventa-detail',
    imports: [PrimeModules, ShortDatePipe, FormatCurrencyPipe, FormsModule],
    templateUrl: './postventa-detail.component.html',
    styleUrl: './postventa-detail.component.css'
})
export class PostVentaDetailComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly searchSubject = new Subject<string>();
    breadcrumbs = [{ label: 'Remanufactura' }];

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    postventaDetalleStore = inject(PostVentaDetalleStore);
    toast = inject(ToastService);
    confirmationDialogService = inject(ConfirmationDialog);

    private readonly maxFileSizeInMB = 10;
    readonly maxFileSizeInBytes = this.maxFileSizeInMB * 1024 * 1024;
    private readonly searchDebounceTimeMs = 500;

    detalles = signal<DTOLiquidacionPostVentaDetalle[]>([]);
    showImportDialog = signal<boolean>(false);

    protected readonly liquidacionPostventaId = signal<number | null>(null);
    protected readonly pagination = computed(() => this.postventaDetalleStore.pagination());
    protected readonly totalRecords = computed(() => this.pagination()?.totalItems || 0);
    protected readonly selectedItems = signal<DTOLiquidacionPostVentaDetalle[]>([]);
    protected readonly pageSize = computed(() => this.postventaDetalleStore.pageSize());
    protected searchModel = '';
    protected readonly isDeleting = computed(() => this.postventaDetalleStore.isDeleting());
    protected readonly deleteButtonLabel = computed(() => {
        const count = this.selectedItems().length;
        return count ? `Eliminar (${count})` : 'Eliminar';
    });

    @ViewChild('fileUploader') fileUploader?: FileUpload;
    protected readonly dataTable = viewChild.required<Table>('dataTable');

    constructor() {
        effect(() => {
            const entity = this.postventaDetalleStore.liquidacionPostventa();
            if (entity) {
                this.loadContrata(entity.contrataId);

                if (!this.postventaDetalleStore.isSubmitting() && this.fileUploader?.hasFiles()) {
                    this.fileUploader.clear();
                }
            }
        });

        this.setupSearchSubscription();
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.postventaDetalleStore.getPostventaById(id);
            this.liquidacionPostventaId.set(id);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    protected loadContrata(contrataId: number): void {
        this.postventaDetalleStore.getContrataById(contrataId);
    }

    goBack() {
        this.postventaDetalleStore.cancelGetDetailData();
        this.postventaDetalleStore.clear();
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    handleToggleImport() {
        this.showImportDialog.set(!this.showImportDialog());
    }

    downloadExcelTemplate() {
        console.log('descargaando template');
    }

    handleImportAgain() {
        this.postventaDetalleStore.clearPreview();
        this.showImportDialog.set(true);
    }

    protected onSearchInputChange(): void {
        this.searchSubject.next(this.searchModel);
    }

    private performSearch(searchValue: string): void {
        this.postventaDetalleStore.setSearchFilter(searchValue);

        const liquidacionPostventaId = this.liquidacionPostventaId();
        if (!liquidacionPostventaId) {
            return;
        }

        this.dataTable().reset();
    }

    protected onClearFilters(): void {
        this.clearSearchState();
        this.reloadData();
    }

    private clearSearchState(): void {
        this.searchModel = '';
        this.postventaDetalleStore.setSearchFilter('');
    }

    private reloadData(): void {
        const liquidacionPostventaId = this.liquidacionPostventaId();
        if (liquidacionPostventaId) {
            this.dataTable().reset();
        }
    }

    private setupSearchSubscription(): void {
        this.searchSubject.pipe(debounceTime(this.searchDebounceTimeMs), takeUntil(this.destroy$)).subscribe((searchValue) => {
            this.performSearch(searchValue);
        });
    }

    protected getEstadoLiquidacionLabel(): string {
        const estado = this.postventaDetalleStore.liquidacionPostventa()?.estado;
        return estado === EstadoLiquidacion.Pendiente ? 'Pendiente' : 'Importado';
    }

    protected getEstadoLiquidacionSeverity(): 'warning' | 'success' {
        const estado = this.postventaDetalleStore.liquidacionPostventa()?.estado;
        return estado === EstadoLiquidacion.Pendiente ? 'warning' : 'success';
    }

    protected formatFechaIngreso(fechaIngreso: string | null | undefined): string {
        if (!fechaIngreso) {
            return 'Sin fecha';
        }

        try {
            const fecha = parseISO(fechaIngreso);
            return format(fecha, 'MMMM yyyy', { locale: es }).toUpperCase();
        } catch (error) {
            return 'Fecha inválida';
        }
    }

    async handleUploadFile(event: { files: File[] }): Promise<void> {
        const file = event.files[0];
        const fechaLiquidacionPostventa = this.postventaDetalleStore.liquidacionPostventa()!.fechaIngreso;
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
        const nombre = this.postventaDetalleStore.liquidacionPostventa()?.id;
        if (!nombre) return this.toast.warn('No hay una liquidación seleccionada.');
        this.postventaDetalleStore.export(nombre);
    }

    getFileSizeInMB(sizeKB: number): string {
        if (!sizeKB) return '0 MB';
        const sizeMB = sizeKB / (1024 * 1024);
        return `${sizeMB.toFixed(2)} MB`;
    }

    protected deleteSelectedItems() {
        this.confirmationDialogService.confirmDelete().subscribe((confirmed) => {
            if (confirmed) {
                const selectedItems = this.selectedItems();

                if (selectedItems.length === 0) {
                    return;
                }

                const liquidacionPostventaId = this.liquidacionPostventaId();

                if (!liquidacionPostventaId) {
                    return;
                }

                const deleteRequest: DeleteLiquidacionPostventaDetalleByIdsRequest = {
                    liquidacionPostventaDetalleIds: selectedItems.map((item) => item.id)
                };

                this.postventaDetalleStore.deleteByIds(liquidacionPostventaId, deleteRequest);
                this.selectedItems.set([]);
            }
        });
    }

    protected deleteAllItems() {
        this.confirmationDialogService.confirmDelete().subscribe((confirmed) => {
            if (confirmed) {
                const liquidacionPostventaId = this.liquidacionPostventaId();

                if (!liquidacionPostventaId) {
                    return;
                }

                this.postventaDetalleStore.deleteByLiquidacionPostventaId(liquidacionPostventaId);
                this.selectedItems.set([]);
                this.dataTable().reset();
            }
        });
    }

    protected onPageChange(event: TableLazyLoadEvent): void {
        if (this.isDeleting()) {
            return;
        }

        const liquidacionPostventaId = this.liquidacionPostventaId();
        if (liquidacionPostventaId && event.first !== undefined && event.rows !== null && event.rows !== undefined) {
            this.selectedItems.set([]);
            const currentPage = Math.floor(event.first / event.rows) + 1;

            this.postventaDetalleStore.setCurrentPage(currentPage);
            if (event.rows !== this.pageSize()) {
                this.postventaDetalleStore.setPageSize(event.rows);
            }

            this.postventaDetalleStore.loadCurrentData(liquidacionPostventaId);
        }
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
