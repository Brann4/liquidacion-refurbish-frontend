import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeModules } from '@/utils/PrimeModule';
import { Table } from 'primeng/table';
import { RecuperoDetalleStore } from '@/pages/recupero-detalle/stores/recupero-detalle.store';
import { PreviewLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/preview-liquidacion-recupero-detalle-request';
import { CreateLiquidacionRecuperoDetalleRequest } from '@/pages/recupero-detalle/entities/create-liquidacion-recupero-detalle-request';
import { LiquidacionRecuperoDetalle } from '@/pages/recupero-detalle/entities/liquidacion-recupero-detalle';
import { TipoZona } from '@/pages/precio-zona/entities/precio-zona';
import { EstadoPago } from '@/pages/recupero-detalle/entities/estado-pago';
import { EstadoLiquidacion } from '@/utils/estado-liquidacion';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';

@Component({
    selector: 'app-view-recupero-detalle',
    imports: [PrimeModules, ShortDatePipe, FormatCurrencyPipe],
    templateUrl: './view-recupero-detalle.html',
    styles: ``
})
export class ViewRecuperoDetalle implements OnInit {
    private readonly recuperoDetalleStore = inject(RecuperoDetalleStore);
    private confirmationDialogService = inject(ConfirmationDialog);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    protected readonly showUploadSection = signal(false);
    protected readonly liquidacionRecuperoId = signal<number | null>(null);
    protected readonly selectedItems = signal<LiquidacionRecuperoDetalle[]>([]);

    protected readonly entities = computed(() => this.recuperoDetalleStore.entities());
    protected readonly entitiesPreview = computed(() => this.recuperoDetalleStore.entitiesPreview());
    protected readonly contrata = computed(() => this.recuperoDetalleStore.contrata());
    protected readonly liquidacionRecupero = computed(() => this.recuperoDetalleStore.liquidacionRecupero());
    protected readonly isLoadingEntities = computed(() => this.recuperoDetalleStore.isLoadingEntities());
    protected readonly isLoadingPreview = computed(() => this.recuperoDetalleStore.isLoadingPreview());
    protected readonly isLoadingCreate = computed(() => this.recuperoDetalleStore.isLoadingCreate());
    protected readonly isExporting = computed(() => this.recuperoDetalleStore.isExporting());

    constructor() {
        effect(() => {
            const liquidacionRecupero = this.recuperoDetalleStore.liquidacionRecupero();
            if (liquidacionRecupero) {
                this.loadContrata(liquidacionRecupero.contrataId);
            }
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const liquidacionRecuperoId = parseInt(id, 10);
            this.liquidacionRecuperoId.set(liquidacionRecuperoId);
            this.loadRecuperoById(liquidacionRecuperoId);
            this.loadEntitiesByRecupero(liquidacionRecuperoId);
        }
    }

    protected loadRecuperoById(id: number): void {
        this.recuperoDetalleStore.getRecuperoById(id);
    }

    protected loadEntitiesByRecupero(liquidacionRecuperoId: number): void {
        this.recuperoDetalleStore.getByRecupero(liquidacionRecuperoId);
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

    protected onUpload(event: { files: File[] }): void {
        const file = event.files[0];

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

    protected onGlobalFilter(event: Event, dataTable: Table): void {
        const target = event.target as HTMLInputElement | null;
        const filterValue = target?.value ?? '';
        dataTable.filterGlobal(filterValue, 'contains');
    }

    protected onClearFilters(dataTable: Table): void {
        dataTable.clear();
    }

    protected getEstadoLiquidacionLabel(): string {
        const estado = this.liquidacionRecupero()?.estado;
        return estado === EstadoLiquidacion.Pendiente ? 'Pendiente' : 'Importado';
    }

    protected getEstadoLiquidacionSeverity(): 'warning' | 'success' {
        const estado = this.liquidacionRecupero()?.estado;
        return estado === EstadoLiquidacion.Pendiente ? 'warning' : 'success';
    }

    protected formatFileSize(sizeInBytes: number): string {
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
                const allItems = this.entities();
                const liquidacionRecuperoId = this.liquidacionRecuperoId();

                if (!liquidacionRecuperoId) {
                    return;
                }

                if (selectedItems.length === allItems.length) {
                    this.recuperoDetalleStore.deleteByLiquidacionRecuperoId(liquidacionRecuperoId);
                } else {
                    const deleteRequest = {
                        liquidacionRecuperoDetalleIds: selectedItems.map((item) => item.id)
                    };
                    this.recuperoDetalleStore.deleteByIds(deleteRequest);
                }

                this.selectedItems.set([]);
            }
        });
    }
}
