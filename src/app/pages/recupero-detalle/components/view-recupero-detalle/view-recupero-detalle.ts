import { Component, computed, effect, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RecuperoDetalleStore } from '@/pages/recupero-detalle/stores/recupero-detalle.store';
import { PreviewLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/preview-liquidacion-recupero-detalle-request';
import { CreateLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/create-liquidacion-recupero-detalle-request';
import { DeleteLiquidacionRecuperoDetalleByIdsRequest } from '@/pages/recupero-detalle/entities/delete-liquidacion-recupero-detalle-by-ids-request';
import { LiquidacionRecuperoDetalle } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle';
import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';
import { EstadoPago } from '@/pages/recupero-detalle/entities/estado-pago';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { ToastService } from '@/layout/service/toast.service';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';
import { EstadoLiquidacion } from '@/utils/estado-liquidacion';
import { PrimeModules } from '@/utils/PrimeModule';

@Component({
    selector: 'app-view-recupero-detalle',
    imports: [PrimeModules, ShortDatePipe, FormatCurrencyPipe, FormsModule],
    templateUrl: './view-recupero-detalle.html',
    styles: ``
})
export class ViewRecuperoDetalle implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly searchSubject = new Subject<string>();
    private readonly recuperoDetalleStore = inject(RecuperoDetalleStore);
    private readonly confirmationDialogService = inject(ConfirmationDialog);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    private readonly maxFileSizeInMB = 10;
    readonly maxFileSizeInBytes = this.maxFileSizeInMB * 1024 * 1024;
    private readonly searchDebounceTimeMs = 500;

    protected readonly showUploadSection = signal(false);
    protected readonly liquidacionRecuperoId = signal<number | null>(null);
    protected readonly selectedItems = signal<LiquidacionRecuperoDetalle[]>([]);
    protected readonly pageSize = computed(() => this.recuperoDetalleStore.pageSize());
    protected searchModel = '';

    protected readonly entities = computed(() => this.recuperoDetalleStore.entities());
    protected readonly entitiesPreview = computed(() => this.recuperoDetalleStore.entitiesPreview());
    protected readonly contrata = computed(() => this.recuperoDetalleStore.contrata());
    protected readonly liquidacionRecupero = computed(() => this.recuperoDetalleStore.liquidacionRecupero());
    protected readonly pagination = computed(() => this.recuperoDetalleStore.pagination());
    protected readonly totalRecords = computed(() => this.pagination()?.totalItems || 0);
    protected readonly isLoadingEntities = computed(() => this.recuperoDetalleStore.isLoadingEntities());
    protected readonly isLoadingPreview = computed(() => this.recuperoDetalleStore.isLoadingPreview());
    protected readonly isLoadingCreate = computed(() => this.recuperoDetalleStore.isLoadingCreate());
    protected readonly isExporting = computed(() => this.recuperoDetalleStore.isExporting());
    protected readonly isDeleting = computed(() => this.recuperoDetalleStore.isDeleting());
    protected readonly deleteButtonLabel = computed(() => {
        const count = this.selectedItems().length;
        return count ? `Eliminar (${count})` : 'Eliminar';
    });

    protected readonly dataTable = viewChild.required<Table>('dataTable');

    constructor() {
        effect(() => {
            const liquidacionRecupero = this.recuperoDetalleStore.liquidacionRecupero();
            if (liquidacionRecupero) {
                this.loadContrata(liquidacionRecupero.contrataId);
            }
        });

        this.setupSearchSubscription();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const liquidacionRecuperoId = parseInt(id, 10);
            this.liquidacionRecuperoId.set(liquidacionRecuperoId);
            this.loadRecuperoById(liquidacionRecuperoId);
        }
    }

    protected loadRecuperoById(id: number): void {
        this.recuperoDetalleStore.getRecuperoById(id);
    }

    protected loadContrata(contrataId: number): void {
        this.recuperoDetalleStore.getContrataById(contrataId);
    }

    protected exportRecuperoDetalle(): void {
        const liquidacionRecuperoId = this.liquidacionRecuperoId();
        if (liquidacionRecuperoId) {
            this.recuperoDetalleStore.export(liquidacionRecuperoId);
        }
    }

    protected onImportClick(): void {
        this.showUploadSection.set(true);
        this.recuperoDetalleStore.clearPreview();
    }

    protected onUpload(event: FileUploadHandlerEvent): void {
        const [file] = event.files;

        if (!file) {
            this.toast.error('No se seleccionó ningún archivo.');
            return;
        }

        if (file.size > this.maxFileSizeInBytes) {
            this.toast.error(`El archivo es demasiado grande (${this.formatSizeInMB(file.size)}). El límite es 10MB.`);
            return;
        }

        const request: PreviewLiquidacionRecuperoDetalleRequest = {
            file: file
        };

        this.recuperoDetalleStore.preview(request);
        this.showUploadSection.set(false);
    }

    protected onCancelUpload(): void {
        this.showUploadSection.set(false);
        this.recuperoDetalleStore.clearPreview();
    }

    protected onReimport(): void {
        this.showUploadSection.set(true);
        this.recuperoDetalleStore.clearPreview();
    }

    protected onGoBack(): void {
        this.router.navigate(['/pages/recupero']);
    }

    protected onSave(): void {
        this.confirmationDialogService.confirmSave().subscribe((accepted) => {
            if (accepted) {
                const liquidacionRecuperoId = this.liquidacionRecuperoId();
                const entitiesPreview = this.entitiesPreview();

                if (liquidacionRecuperoId && entitiesPreview.length > 0) {
                    const request: CreateLiquidacionRecuperoDetalleRequest = {
                        liquidacionRecuperoId: liquidacionRecuperoId,
                        detalles: entitiesPreview.map((item) => ({
                            codigoSAP: item.codigoSAP,
                            descripcion: item.descripcion,
                            seriePrincipal: item.seriePrincipal,
                            serieSecundaria: item.serieSecundaria,
                            codigoSOT: item.codigoSOT,
                            codigoCliente: item.codigoCliente,
                            cliente: item.cliente,
                            contabilizado: item.contabilizado,
                            ordenCompra: item.ordenCompra,
                            tipoZonaId: item.tipoZonaId,
                            distrito: item.distrito,
                            fechaRecibo: item.fechaRecibo,
                            plataforma: item.plataforma
                        }))
                    };

                    this.recuperoDetalleStore.create(request);
                }
            }
        });
    }

    protected getTipoZonaLabel(tipoZonaId: TipoZona): string {
        return tipoZonaId === TipoZona.LimaMetropolitana ? 'Lima Metropolitana' : 'Provincias';
    }

    protected getTipoZonaSeverity(tipoZonaId: TipoZona): 'info' | 'success' {
        return tipoZonaId === TipoZona.LimaMetropolitana ? 'info' : 'success';
    }

    protected getEstadoPagoLabel(estadoPago: EstadoPago): string {
        return estadoPago === EstadoPago.SinPago ? 'Sin Pago' : 'Con Pago';
    }

    protected getEstadoPagoSeverity(estadoPago: EstadoPago): 'danger' | 'success' {
        return estadoPago === EstadoPago.SinPago ? 'danger' : 'success';
    }

    protected onSearchInputChange(): void {
        this.searchSubject.next(this.searchModel);
    }

    private performSearch(searchValue: string): void {
        this.recuperoDetalleStore.setSearchFilter(searchValue);

        const liquidacionRecuperoId = this.liquidacionRecuperoId();
        if (!liquidacionRecuperoId) {
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
        this.recuperoDetalleStore.setSearchFilter('');
    }

    private reloadData(): void {
        const liquidacionRecuperoId = this.liquidacionRecuperoId();
        if (liquidacionRecuperoId) {
            this.dataTable().reset();
        }
    }

    private setupSearchSubscription(): void {
        this.searchSubject.pipe(debounceTime(this.searchDebounceTimeMs), takeUntil(this.destroy$)).subscribe((searchValue) => {
            this.performSearch(searchValue);
        });
    }

    protected getEstadoLiquidacionLabel(): string {
        const estado = this.liquidacionRecupero()?.estado;
        return estado === EstadoLiquidacion.Pendiente ? 'Pendiente' : 'Importado';
    }

    protected getEstadoLiquidacionSeverity(): 'warning' | 'success' {
        const estado = this.liquidacionRecupero()?.estado;
        return estado === EstadoLiquidacion.Pendiente ? 'warning' : 'success';
    }

    protected formatSizeInMB(sizeInBytes: number): string {
        const sizeInMB = sizeInBytes / (1024 * 1024);
        return `${sizeInMB.toFixed(2)} MB`;
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

    protected deleteSelectedItems() {
        this.confirmationDialogService.confirmDelete().subscribe((confirmed) => {
            if (confirmed) {
                const selectedItems = this.selectedItems();

                if (selectedItems.length === 0) {
                    return;
                }

                const deleteRequest: DeleteLiquidacionRecuperoDetalleByIdsRequest = {
                    liquidacionRecuperoDetalleIds: selectedItems.map((item) => item.id)
                };

                this.recuperoDetalleStore.deleteByIds(deleteRequest);
                this.selectedItems.set([]);
            }
        });
    }

    protected deleteAllItems() {
        this.confirmationDialogService.confirmDelete().subscribe((confirmed) => {
            if (confirmed) {
                const liquidacionRecuperoId = this.liquidacionRecuperoId();

                if (!liquidacionRecuperoId) {
                    return;
                }

                this.recuperoDetalleStore.deleteByLiquidacionRecuperoId(liquidacionRecuperoId);
                this.selectedItems.set([]);
                this.dataTable().reset();
            }
        });
    }

    protected onPageChange(event: TableLazyLoadEvent): void {
        if (this.isDeleting()) {
            return;
        }

        const liquidacionRecuperoId = this.liquidacionRecuperoId();
        if (liquidacionRecuperoId && event.first !== undefined && event.rows !== null && event.rows !== undefined) {
            this.selectedItems.set([]);
            const currentPage = Math.floor(event.first / event.rows) + 1;

            this.recuperoDetalleStore.setCurrentPage(currentPage);
            if (event.rows !== this.pageSize()) {
                this.recuperoDetalleStore.setPageSize(event.rows);
            }

            this.recuperoDetalleStore.loadCurrentData(liquidacionRecuperoId);
        }
    }
}
