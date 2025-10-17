import { PrimeModules } from '@/utils/PrimeModule';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RemanufacturaStore } from '../../stores/RemanufacturaStore';
import { ShortDatePipe } from '@/layout/pipes/shortDate.pipe';
import { RemanufacturaDetalleStore } from '../../stores/RemanufacturaDetalleStore';
import { Estado } from '@/utils/Constants';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [PrimeModules, ShortDatePipe],
    templateUrl: './remanufactura-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemanufacturaDetailComponent implements OnInit {
    route = inject(ActivatedRoute);
    router = inject(Router);
    remanufacturaStore = inject(RemanufacturaStore);
    remanufacturaDetalleStore = inject(RemanufacturaDetalleStore);

    constructor() {
        effect(() => {
            const entity = this.remanufacturaStore.entity();
            if (entity?.nombreLiquidacion) {
                this.remanufacturaDetalleStore.getLiquidaciones(entity.nombreLiquidacion, Estado.Activo);
            }
        });
    }
    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) this.remanufacturaStore.getById(id);
    }

    goBack() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
}
