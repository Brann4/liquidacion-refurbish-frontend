import { Component, computed, inject, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ProductoDescontinuadoStore } from '@/pages/producto-descontinuado/store/producto-descontinuado.store';
import { ProductoDescontinuado } from '@/pages/producto-descontinuado/entities/producto-descontinuado';
import { ProductoDescontinuadoModal } from '@/pages/producto-descontinuado/components/producto-descontinuado-modal/producto-descontinuado-modal';
import { PrimeModules } from '@/utils/PrimeModule';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';

@Component({
    selector: 'app-view-producto-descontinuado',
    imports: [PrimeModules, ProductoDescontinuadoModal, ShortDatePipe],
    templateUrl: './view-producto-descontinuado.html',
    styles: ``
})
export class ViewProductoDescontinuado implements OnInit {
    private readonly discontinuedProductStore = inject(ProductoDescontinuadoStore);
    private confirmationDialogService = inject(ConfirmationDialog);
    protected readonly discontinuedProducts = computed(() => this.discontinuedProductStore.entities());

    ngOnInit(): void {
        this.loadDiscontinuedProducts();
    }

    protected loadDiscontinuedProducts(): void {
        this.discontinuedProductStore.getAll();
    }

    protected openCreateModal(): void {
        this.discontinuedProductStore.openModalCreate();
    }

    protected onEditProduct(product: ProductoDescontinuado): void {
        this.discontinuedProductStore.openModalEdit(product);
    }

    protected onDeleteProduct(product: ProductoDescontinuado): void {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.discontinuedProductStore.delete(product.id);
            }
        });
    }

    protected getStatusLabel(isActive: boolean): string {
        return isActive ? 'Activo' : 'Inactivo';
    }

    protected getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    protected onGlobalFilter(event: Event, dataTable: Table): void {
        const target = event.target as HTMLInputElement | null;
        const filterValue = target?.value ?? '';
        dataTable.filterGlobal(filterValue, 'contains');
    }
}
