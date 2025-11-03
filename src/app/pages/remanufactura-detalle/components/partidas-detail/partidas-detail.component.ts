import { PartidaStore } from '@/pages/partida/stores/PartidaStore';
import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RemanufacturaDetalleStore } from '../../stores/RemanufacturaDetalleStore';
import { Estado } from '@/utils/Constants';
import { Table } from 'primeng/table';
import { DTOPartida } from '@/pages/partida/entities/partida/DTOPartida';
import { FormatCurrencyPipe } from '@/utils/format-currency-pipe';

@Component({
    selector: 'remanufactura-partidas-detail',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, FormatCurrencyPipe],
    templateUrl: './partidas-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemanufacturaPartidasDetailComponent {
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);
    partidaStore = inject(PartidaStore);

    selectedData! : DTOPartida[] | null;


    constructor() {
        this.loadPartidas();
    }

    handleCloseModal() {
        this.remanufacturaDetalleStore.closeModalPartidasManagment();
        this.selectedData = null;
        this.resetFormData();
    }

    loadPartidas() {
        this.partidaStore.list(Estado.Activo);
    }

    resetFormData() {}

    clearFilters(table: Table) {
        table.clear();
        table.filterGlobal('', '');
    }
    /*
    isInvalid(controlName: string) {
        const control = this.updateForm.get(controlName);
        return control?.invalid && (control.touched || control.dirty) && this.isSubmitting;
    }
*/
    handleSubmit() {
        console.log("ENTIDADES SELECCIONADA P");
        console.log(this.selectedData);
        /*this.updateForm.markAllAsTouched();

        if (this.updateForm.valid) {
            const newRemanufactura = this.updateForm.getRawValue();
            this.remanufacturaStore.update(newRemanufactura as DTOUpdateLiquidacionRemanufactura);
        }
        this.updateForm.markAsPristine();
        this.updateForm.markAsUntouched();*/
    }
}
