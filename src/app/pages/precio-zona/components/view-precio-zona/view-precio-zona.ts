import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { PrecioZonaStore } from '@/pages/precio-zona/store/precio-zona.store';
import { ContrataStore } from '@/pages/contrata/store/contrata.store';
import { PrecioZona, TipoZona } from '@/pages/precio-zona/entities/precio-zona';
import { Contrata } from '@/pages/contrata/entities/contrata';
import { PrecioZonaModal } from '@/pages/precio-zona/components/precio-zona-modal/precio-zona-modal';
import { PrimeModules } from '@/utils/PrimeModule';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';
import { ToastService } from '@/layout/service/toast.service';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';

@Component({
    selector: 'app-view-precio-zona',
    imports: [PrimeModules, PrecioZonaModal, FormsModule, FormatCurrencyPipe],
    templateUrl: './view-precio-zona.html',
    styles: ``
})
export class ViewPrecioZona implements OnInit {
    private readonly precioZonaStore = inject(PrecioZonaStore);
    private readonly contrataStore = inject(ContrataStore);
    private readonly confirmationDialogService = inject(ConfirmationDialog);
    private readonly toast = inject(ToastService);

    protected readonly preciosZona = computed(() => this.precioZonaStore.entities());
    protected readonly contratas = computed(() => this.contrataStore.entities());
    protected readonly isLoading = computed(() => this.precioZonaStore.isSubmitting());

    protected readonly selectedContrata = signal<Contrata | null>(null);
    protected readonly selectedContrataId = computed(() => this.selectedContrata()?.id || null);

    ngOnInit(): void {
        this.loadContratas();
    }

    protected loadContratas(): void {
        this.contrataStore.getAll();
    }

    protected onContrataChange(contrata: Contrata | null): void {
        this.selectedContrata.set(contrata);
        if (contrata) {
            this.precioZonaStore.setCurrentContrata(contrata.id);
            this.loadPreciosZona(contrata.id);
        }
    }

    protected loadPreciosZona(contrataId: number): void {
        this.precioZonaStore.getByContrata(contrataId);
    }

    protected openCreateModal(): void {
        const selectedContrata = this.selectedContrata();
        if (!selectedContrata) {
            this.toast.warn('Debe seleccionar una contrata primero');
            return;
        }
        this.precioZonaStore.openModalCreate();
    }

    protected onEditPrecioZona(precioZona: PrecioZona): void {
        this.precioZonaStore.openModalEdit(precioZona);
    }

    protected onDeletePrecioZona(precioZona: PrecioZona): void {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.precioZonaStore.delete(precioZona.id);
            }
        });
    }

    protected getTipoZonaLabel(tipoZona: TipoZona): string {
        return tipoZona === TipoZona.LimaMetropolitana ? 'Lima Metropolitana' : 'Provincias';
    }

    protected getTipoZonaSeverity(tipoZonaId: TipoZona): 'success' | 'info' {
        return tipoZonaId === 0 ? 'success' : 'info';
    }
}
