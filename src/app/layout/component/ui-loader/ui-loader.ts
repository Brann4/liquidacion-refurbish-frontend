import { ContrataStore } from '@/pages/contrata/store/contrata.store';
import { PostVentaDetalleStore } from '@/pages/postventa-detalle/stores/PostVentaDetalleStore';
import { PostventaStore } from '@/pages/postventa/stores/postventa.store';
import { PrecioZonaStore } from '@/pages/precio-zona/store/precio-zona.store';
import { ProductoDescontinuadoStore } from '@/pages/producto-descontinuado/store/producto-descontinuado.store';
import { RecuperoDetalleStore } from '@/pages/recupero-detalle/stores/recupero-detalle.store';
import { RecuperoStore } from '@/pages/recupero/stores/recupero.store';
import { RemanufacturaDetalleStore } from '@/pages/remanufactura-detalle/stores/RemanufacturaDetalleStore';
import { RemanufacturaStore } from '@/pages/remanufactura/stores/RemanufacturaStore';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'progress-ui-loader',
  standalone: true,
  imports: [BlockUIModule,ProgressSpinnerModule],
  template: `
        <p-blockUI [blocked]="isLoading()">
            <div class="h-full w-full flex flex-col justify-center items-center align-middle">
                <p-progressSpinner strokeWidth="4" fill="transparent" animationDuration=".8s" ></p-progressSpinner>
                <p class="text-white font-bold text-2xl">Cargando datos ...</p>
            </div>
        </p-blockUI>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiLoader {
    remanufacturaStore = inject(RemanufacturaStore);
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);
    recuperoStore = inject(RecuperoStore)
    recuperoDetalleStore = inject(RecuperoDetalleStore);
    postventaStore = inject(PostventaStore);
    postventaDetalleStore = inject(PostVentaDetalleStore);
    contrataStore = inject(ContrataStore);
    productoDescontinuadoStore = inject(ProductoDescontinuadoStore);
    precioZonaStore = inject(PrecioZonaStore);

    isLoading = computed ( () =>
        this.remanufacturaStore.isLoadingData() ||
        this.remanufacturaDetalleStore.isLoadingDetailData()  ||
        this.remanufacturaDetalleStore.isLoadingDataPreview() ||
        this.recuperoStore.isLoadingEntities() ||
        this.recuperoDetalleStore.isLoadingEntities() ||
        this.postventaStore.isLoadingEntities() ||
        this.postventaDetalleStore.isLoadingDetailData() ||
        this.contrataStore.isLoadingEntities() ||
        this.productoDescontinuadoStore.isLoadingEntities() ||
        this.precioZonaStore.isLoadingEntities()
    );

}
